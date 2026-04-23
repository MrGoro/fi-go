import { ref, update } from 'firebase/database';
import { db } from '../config/firebase';

/**
 * Resets the entire work session for a user by clearing
 * both the startTime and the breaks list.
 */
export async function resetWorkSession(uid: string) {
  if (!uid) return;
  
  // We use a multi-path update approach to ensure atomicity 
  // or at least clear both in one logical step.
  const updates: Record<string, unknown> = {};
  updates[`data/${uid}/startTime`] = null;
  updates[`data/${uid}/breaks`] = null;
  
  // Realtime Database 'set' with null on parent paths effectively deletes them
  const baseRef = ref(db);
  // Using update or multiple sets. update is more atomic for multiple paths.
  // Actually, import { update } from 'firebase/database';
  // Let's use set for simplicity on separate refs if update is not immediate,
  // but a single 'update' call is better.
  
  try {
    await update(baseRef, updates);
  } catch (error) {
    console.error('Error resetting work session:', error);
    throw error;
  }
}
