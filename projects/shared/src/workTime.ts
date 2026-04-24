import { differenceInMilliseconds } from 'date-fns';
import { WORK_TIME_TARGET_MINUTES } from './constants';

// Gross work time in milliseconds
export function calculateGrossWorkTimeMillis(startTime: Date, now: Date): number {
  return Math.max(0, differenceInMilliseconds(now, startTime));
}

// Gross work time in minutes
export function calculateGrossWorkTimeMinutes(startTime: Date, now: Date): number {
  return Math.floor(calculateGrossWorkTimeMillis(startTime, now) / 60000);
}

// Net work time = gross minus applied break
export function calculateNetWorkTimeMinutes(grossWorkMinutes: number, appliedBreakMinutes: number): number {
  return Math.max(0, grossWorkMinutes - appliedBreakMinutes);
}

// Saldo = net minus daily target (negative = under, positive = over)
export function calculateSaldoMinutes(netWorkMinutes: number): number {
  return netWorkMinutes - WORK_TIME_TARGET_MINUTES;
}
