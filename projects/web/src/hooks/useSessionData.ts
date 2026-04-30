import { useEffect, useState } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { isToday } from 'date-fns';
import { resetWorkSession } from '../lib/firebase-actions';
import { useToast } from './use-toast';
import type { BreakRecord } from '@figo/shared';

export interface FirebaseBreakRecord extends BreakRecord {
  id: string;
}

export interface SessionData {
  startTime: Date | null;
  breaks: FirebaseBreakRecord[];
  dailyMaxOvertimeMinutes: number | null;
  liveBreakStart: Date | null;
  loading: boolean;
}

export function useSessionData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<SessionData>({
    startTime: null,
    breaks: [],
    dailyMaxOvertimeMinutes: null,
    liveBreakStart: null,
    loading: true
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    // Reset state and ensure loading is true when we start fetching for a new user
    setData({
      startTime: null,
      breaks: [],
      dailyMaxOvertimeMinutes: null,
      liveBreakStart: null,
      loading: true
    });

    // Listen to the parent node for atomic updates
    const sessionRef = ref(db, `data/${user.uid}`);
    const unsubscribe = onValue(
      sessionRef, 
      (snapshot) => {
        const val = snapshot.val();
        
        let startTime: Date | null = null;
        let breaks: FirebaseBreakRecord[] = [];
        let dailyMaxOvertimeMinutes: number | null = null;
        let liveBreakStart: Date | null = null;

        if (val) {
          // Parse Start Time
          if (val.startTime) {
            const date = new Date(val.startTime);
            if (!isToday(date)) {
              // Auto-reset if it's an old session
              resetWorkSession(user.uid).catch((error) => {
                console.error('Auto-reset failed:', error);
                toast({
                  title: 'Fehler beim Zurücksetzen',
                  description: 'Der gestrige Arbeitstag konnte nicht zurückgesetzt werden.',
                  variant: 'destructive'
                });
              });
              startTime = null;
              breaks = [];
            } else {
              startTime = date;
            }
          }

          // Parse Breaks
          if (val.breaks && startTime) {
            breaks = Object.keys(val.breaks).map(key => ({
              id: key,
              start: new Date(val.breaks[key].start),
              end: new Date(val.breaks[key].end)
            }));
          }

          // Parse daily max overtime setting
          if (typeof val.dailyMaxOvertimeMinutes === 'number' && startTime) {
            dailyMaxOvertimeMinutes = val.dailyMaxOvertimeMinutes;
          }

          // Parse live break start
          if (typeof val.liveBreakStart === 'number' && startTime) {
            liveBreakStart = new Date(val.liveBreakStart);
          }
        }

        setData({
          startTime,
          breaks,
          dailyMaxOvertimeMinutes,
          liveBreakStart,
          loading: false
        });
      },
      (error) => {
        console.error('Session listener error:', error);
        toast({
          title: 'Verbindungsfehler',
          description: 'Deine Daten konnten nicht geladen werden.',
          variant: 'destructive'
        });
        setData(prev => ({ ...prev, loading: false }));
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const clockIn = async (date: Date = new Date()) => {
    if (!user) return;
    try {
      const startRef = ref(db, `data/${user.uid}/startTime`);
      await set(startRef, date.getTime());
    } catch (error) {
      console.error('Clock in error:', error);
      toast({
        title: 'Fehler beim Einstempeln',
        description: 'Bitte versuche es erneut.',
        variant: 'destructive'
      });
    }
  };

  const clockOut = async () => {
    if (!user) return;
    try {
      await resetWorkSession(user.uid);
    } catch (error) {
      console.error('Clock out error:', error);
      toast({
        title: 'Fehler beim Ausstempeln',
        description: 'Der Arbeitstag konnte nicht beendet werden.',
        variant: 'destructive'
      });
    }
  };

  const addBreak = async (start: Date, end: Date) => {
    if (!user) return;
    try {
      const breaksRef = ref(db, `data/${user.uid}/breaks`);
      await push(breaksRef, {
        start: start.getTime(),
        end: end.getTime()
      });
    } catch (error) {
      console.error('Add break error:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: 'Die Pause konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  };

  const removeBreak = async (id: string) => {
    if (!user) return;
    try {
      const breakRef = ref(db, `data/${user.uid}/breaks/${id}`);
      await remove(breakRef);
    } catch (error) {
      console.error('Remove break error:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: 'Die Pause konnte nicht gelöscht werden.',
        variant: 'destructive'
      });
    }
  };

  const startLiveBreak = async (startTime: Date) => {
    if (!user) return;
    try {
      const liveRef = ref(db, `data/${user.uid}/liveBreakStart`);
      await set(liveRef, startTime.getTime());
    } catch (error) {
      console.error('Start live break error:', error);
      toast({
        title: 'Fehler beim Starten der Pause',
        description: 'Bitte versuche es erneut.',
        variant: 'destructive'
      });
    }
  };

  const endLiveBreak = async (endTime: Date) => {
    if (!user || !data.liveBreakStart) return;
    const breakStart = data.liveBreakStart;

    // Discard sub-second or zero-length breaks
    if (endTime.getTime() - breakStart.getTime() < 1000) {
      await remove(ref(db, `data/${user.uid}/liveBreakStart`));
      return;
    }

    // Generate a new push key for the completed break record
    const newBreakRef = push(ref(db, `data/${user.uid}/breaks`));
    const newBreakKey = newBreakRef.key!;

    // Atomic multi-path write: add completed break + clear liveBreakStart in one operation
    const updates: Record<string, unknown> = {
      [`data/${user.uid}/breaks/${newBreakKey}`]: {
        start: breakStart.getTime(),
        end:   endTime.getTime(),
      },
      [`data/${user.uid}/liveBreakStart`]: null,
    };

    try {
      await update(ref(db), updates);
    } catch (error) {
      console.error('End live break error:', error);
      toast({
        title: 'Fehler beim Beenden der Pause',
        description: 'Bitte versuche es erneut.',
        variant: 'destructive'
      });
    }
  };

  const setDailyMaxOvertime = async (v: number | null) => {
    if (!user) return;
    try {
      const fieldRef = ref(db, `data/${user.uid}/dailyMaxOvertimeMinutes`);
      if (v === null) {
        await remove(fieldRef);
      } else {
        await set(fieldRef, v);
      }
    } catch (error) {
      console.error('Set daily max error:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: 'Das Tages-Maximum konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    }
  };

  return {
    ...data,
    clockIn,
    clockOut,
    addBreak,
    removeBreak,
    setDailyMaxOvertime,
    startLiveBreak,
    endLiveBreak,
  };
}
