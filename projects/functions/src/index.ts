import { onValueWritten } from 'firebase-functions/v2/database';
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFunctions } from 'firebase-admin/functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { WORK_TIME_TARGET_MINUTES, MAX_WORK_LIMIT_MINUTES, calculateManualBreaksMinutes, calculateAppliedBreakMinutes } from '@figo/shared';

// Initialize Firebase Admin
admin.initializeApp();

interface BreakRecord {
  start: Date;
  end: Date;
}

interface PushPayload {
  userId: string;
  type: 'TARGET' | 'LIMIT';
  startTimeMillis: number;
  breaksDurationMinutes: number;
}

export const onSessionDataWritten = onValueWritten({
  ref: '/data/{userId}',
  region: 'us-central1'
}, async (event) => {
  const userId = event.data.after.key;
  if (!userId) return;

  const data = event.data.after.val();

  if (!data || typeof data.startTime !== 'number') {
    logger.info(`Valid session not found for ${userId}. Skipping push schedule.`);
    return;
  }

  const startTimeMillis = data.startTime;
  // Extract Breaks
  const breaks: BreakRecord[] = [];
  if (data.breaks) {
    for (const key of Object.keys(data.breaks)) {
      breaks.push({
        start: new Date(data.breaks[key].start),
        end: new Date(data.breaks[key].end)
      });
    }
  }

  const manualBreaksMinutes = calculateManualBreaksMinutes(breaks);
  const projectedBreakMinutesTarget = calculateAppliedBreakMinutes(WORK_TIME_TARGET_MINUTES, manualBreaksMinutes);
  const projectedBreakMinutesLimit  = calculateAppliedBreakMinutes(MAX_WORK_LIMIT_MINUTES,  manualBreaksMinutes);

  // Calculate projected finish times
  const targetFinishTimeMillis  = startTimeMillis + (WORK_TIME_TARGET_MINUTES + projectedBreakMinutesTarget) * 60 * 1000;
  const tenHoursFinishTimeMillis = startTimeMillis + (MAX_WORK_LIMIT_MINUTES   + projectedBreakMinutesLimit)  * 60 * 1000;

  const queue = getFunctions().taskQueue('onSendPushNotification');

  // Enqueue Target (Feierabend)
  if (targetFinishTimeMillis > Date.now()) {
    try {
      await queue.enqueue(
        { userId, type: 'TARGET', startTimeMillis, breaksDurationMinutes: manualBreaksMinutes },
        { scheduleTime: new Date(targetFinishTimeMillis) }
      );
      logger.info(`Scheduled TARGET notification for ${userId} at ${new Date(targetFinishTimeMillis).toISOString()}`);
    } catch (e) {
      logger.error('Failed to enqueue TARGET task', e);
    }
  }

  // Enqueue Limit (10 Hours)
  if (tenHoursFinishTimeMillis > Date.now()) {
    try {
      await queue.enqueue(
        { userId, type: 'LIMIT', startTimeMillis, breaksDurationMinutes: manualBreaksMinutes },
        { scheduleTime: new Date(tenHoursFinishTimeMillis) }
      );
      logger.info(`Scheduled LIMIT notification for ${userId} at ${new Date(tenHoursFinishTimeMillis).toISOString()}`);
    } catch (e) {
      logger.error('Failed to enqueue LIMIT task', e);
    }
  }
});

export const onSendPushNotification = onTaskDispatched<PushPayload>(
  {
    retryConfig: { maxAttempts: 3 },
    rateLimits: { maxConcurrentDispatches: 10 },
    region: 'us-central1'
  },
  async (request) => {
    const payload = request.data;

    // Verify current data matches the payload to prevent sending outdated notifications
    const snap = await admin.database().ref(`/data/${payload.userId}`).once('value');
    const data = snap.val();

    if (!data || data.startTime !== payload.startTimeMillis) {
      logger.info(`Task aborted: Session startTime mismatch or session ended. User: ${payload.userId}`);
      return;
    }

    const breaks: BreakRecord[] = [];
    if (data.breaks) {
      for (const key of Object.keys(data.breaks)) {
        breaks.push({
          start: new Date(data.breaks[key].start),
          end: new Date(data.breaks[key].end)
        });
      }
    }

    const currentManualBreaksMinutes = calculateManualBreaksMinutes(breaks);
    if (currentManualBreaksMinutes !== payload.breaksDurationMinutes) {
      logger.info(`Task aborted: Breaks duration changed. Task was for ${payload.breaksDurationMinutes}m, now ${currentManualBreaksMinutes}m. A newer task should be queued.`);
      return;
    }

    // Passed verification, calculate user specific timezone/time string if needed
    // Fetch FCM tokens
    const tokensSnap = await admin.database().ref(`/users/${payload.userId}/fcmTokens`).once('value');
    const tokensData = tokensSnap.val();
    
    if (!tokensData) {
      logger.info(`Task aborted: No FCM Tokens found for user ${payload.userId}`);
      return;
    }

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    // Filter active tokens (lastSeen < 30 days)
    const activeTokens = Object.entries(tokensData)
      .map(([key, value]: [string, any]) => ({ key, ...value }))
      .filter(t => (now - t.lastSeen) < THIRTY_DAYS_MS);

    if (activeTokens.length === 0) {
      logger.info(`Task aborted: No active FCM Tokens found for user ${payload.userId} (all stale).`);
      return;
    }

    const title = payload.type === 'TARGET' ? 'Feierabend!' : '10 Stunden Limit!';
    const body = payload.type === 'TARGET'
      ? `Deine Soll-Arbeitszeit ist jetzt erreicht.`
      : `Du hast deine 10-Stunden-Grenze erreicht! Bitte stempeln.`;

    const message = {
      notification: { title, body },
      webpush: {
        fcmOptions: {
          link: 'https://fi-go.schuermann.app'
        }
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: activeTokens.map(t => t.token),
        ...message
      });

      logger.info(`Sent notifications for ${payload.userId}. Success: ${response.successCount}, Failure: ${response.failureCount}`);

      // Reactive Cleanup: Remove invalid/unregistered tokens
      if (response.failureCount > 0) {
        const cleanupPromises: Promise<void>[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (error?.code === 'messaging/registration-token-not-registered' || 
                error?.code === 'messaging/invalid-registration-token') {
              const tokenKey = activeTokens[idx].key;
              logger.info(`Removing invalid token for user ${payload.userId}: ${tokenKey}`);
              cleanupPromises.push(admin.database().ref(`/users/${payload.userId}/fcmTokens/${tokenKey}`).remove());
            }
          }
        });
        await Promise.all(cleanupPromises);
      }
    } catch (e) {
      logger.error('Failed to send multi-device FCM notification', e);
    }
  }
);

/**
 * Scheduled cleanup of stale tokens (older than 30 days) across all users.
 * Runs once every 24 hours at midnight.
 */
export const cleanupStaleTokens = onSchedule('0 0 * * *', async (event) => {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  
  const usersSnap = await admin.database().ref('/users').once('value');
  const users = usersSnap.val();
  
  if (!users) return;

  const updates: Record<string, null> = {};
  let cleanupCount = 0;

  for (const userId of Object.keys(users)) {
    const tokens = users[userId].fcmTokens;
    if (tokens) {
      for (const tokenKey of Object.keys(tokens)) {
        if (tokens[tokenKey].lastSeen < cutoff) {
          updates[`/users/${userId}/fcmTokens/${tokenKey}`] = null;
          cleanupCount++;
        }
      }
    }
  }

  if (cleanupCount > 0) {
    await admin.database().ref().update(updates);
    logger.info(`Cleaned up ${cleanupCount} stale FCM tokens.`);
  } else {
    logger.info('No stale FCM tokens found to clean up.');
  }
});
