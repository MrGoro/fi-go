export interface Interval { start: number; end: number; }

/**
 * Legt `needed` Minuten gesetzliche Pause in die freien Slots einer Zone,
 * ohne manuelle Pausen zu überlappen.
 */
export function placeInZone(
  zoneStart: number,
  zoneEnd: number,
  needed: number,
  manuals: Interval[],
): Interval[] {
  if (needed <= 0) return [];
  const occupied = manuals
    .map(m => ({ start: Math.max(m.start, zoneStart), end: Math.min(m.end, zoneEnd) }))
    .filter(m => m.end > m.start)
    .sort((a, b) => a.start - b.start);

  const result: Interval[] = [];
  let cursor = zoneStart;
  let remaining = needed;
  for (const occ of occupied) {
    if (remaining <= 0) break;
    if (occ.start > cursor) {
      const use = Math.min(remaining, occ.start - cursor);
      result.push({ start: cursor, end: cursor + use });
      remaining -= use;
    }
    cursor = Math.max(cursor, occ.end);
  }
  if (remaining > 0 && cursor < zoneEnd) {
    const use = Math.min(remaining, zoneEnd - cursor);
    result.push({ start: cursor, end: cursor + use });
  }
  return result;
}

/** Kürzt eine Liste von Intervallen auf insgesamt `total` Minuten (behält Reihenfolge). */
export function trimTotal(ivs: Interval[], total: number): Interval[] {
  if (total <= 0) return [];
  const result: Interval[] = [];
  let remaining = total;
  for (const iv of ivs) {
    if (remaining <= 0) break;
    const use = Math.min(remaining, iv.end - iv.start);
    result.push({ start: iv.start, end: iv.start + use });
    remaining -= use;
  }
  return result;
}

export type SegKind = 'work' | 'over' | 'break';
export interface Seg { start: number; end: number; kind: SegKind; }

/**
 * Nimmt konkrete Break-Intervalle und baut daraus eine chronologische Kette
 * aus work/break-Blöcken, die dann an der Sollzeit-Grenze zu rot/orange
 * aufgesplittet wird. netAccum läuft nur über Work-Blöcke → Sollzeit-Marker
 * stimmt unabhängig davon, wo die Pausen liegen.
 */
export function buildSegments(
  grossMin: number,
  targetMin: number,
  breakIntervals: Interval[],
): Seg[] {
  if (grossMin <= 0) return [];

  const sorted = [...breakIntervals].sort((a, b) => a.start - b.start);

  const raw: Seg[] = [];
  let cursor = 0;
  for (const iv of sorted) {
    const s = Math.max(iv.start, cursor);
    const e = Math.min(iv.end, grossMin);
    if (e <= s) continue;
    if (s > cursor) raw.push({ start: cursor, end: s, kind: 'work' });
    raw.push({ start: s, end: e, kind: 'break' });
    cursor = e;
  }
  if (cursor < grossMin) raw.push({ start: cursor, end: grossMin, kind: 'work' });

  const final: Seg[] = [];
  let netAccum = 0;
  for (const seg of raw) {
    if (seg.kind !== 'work') { final.push(seg); continue; }
    const len = seg.end - seg.start;
    if (len <= 0) continue;
    if (netAccum + len <= targetMin) {
      final.push(seg);
    } else if (netAccum >= targetMin) {
      final.push({ ...seg, kind: 'over' });
    } else {
      const split = seg.start + (targetMin - netAccum);
      final.push({ start: seg.start, end: split, kind: 'work' });
      final.push({ start: split, end: seg.end, kind: 'over' });
    }
    netAccum += len;
  }
  return final;
}
