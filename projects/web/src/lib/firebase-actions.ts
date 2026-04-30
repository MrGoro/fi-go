import { ref, update } from 'firebase/database';
import { db } from '../config/firebase';

/**
 * Resets the entire work session for a user by clearing startTime, breaks,
 * and all per-day settings (dailyMaxOvertimeMinutes).
 */
export async function resetWorkSession(uid: string) {
  if (!uid) return;

  const updates: Record<string, null> = {
    [`data/${uid}/startTime`]:               null,
    [`data/${uid}/breaks`]:                  null,
    [`data/${uid}/dailyMaxOvertimeMinutes`]:  null,
  };

  try {
    await update(ref(db), updates);
  } catch (error) {
    console.error('Error resetting work session:', error);
    throw error;
  }
}
