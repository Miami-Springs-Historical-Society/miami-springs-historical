import type { CollectionEntry } from 'astro:content';

/**
 * Reads the start time from an event's free-text `time` field, e.g. "4:30 PM",
 * "4 PM", "16:30", or "6:00 – 9:00 PM" (a range takes the AM/PM after it).
 * Returns null if no time can be read.
 */
export function parseStartTime(time?: string): { hours: number; minutes: number } | null {
  const m = time?.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2] ?? 0);
  const meridiem = (m[3] ?? time!.slice(m.index! + m[0].length).match(/\b(am|pm)\b/i)?.[1])?.toLowerCase();
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59 || (!meridiem && !m[2])) return null;
  return { hours, minutes };
}

/**
 * Returns the next second Tuesday of a month at the event's start time, local time.
 * The time comes from the event file's `time` field, so that file is the only place
 * to change it. Runs at build time and again in the browser (Events.astro), so a
 * stale static build still shows the right date.
 */
export function nextSecondTuesday(time: string | undefined, startAfter?: Date): Date {
  const start = parseStartTime(time);
  if (!start) throw new Error(`Can't read a start time from "${time}"`);
  const after = startAfter && startAfter > new Date() ? startAfter : new Date();
  for (let offset = 0; offset <= 12; offset++) {
    const year = after.getFullYear() + Math.floor((after.getMonth() + offset) / 12);
    const month = (after.getMonth() + offset) % 12;
    const daysUntilTuesday = (2 - new Date(year, month, 1).getDay() + 7) % 7;
    const secondTuesday = new Date(year, month, 1 + daysUntilTuesday + 7, start.hours, start.minutes, 0);
    if (secondTuesday > after) return secondTuesday;
  }
  throw new Error('No second Tuesday found within a year');
}

/**
 * Resolves a recurring event to its next concrete occurrence date, leaving
 * one-time events unchanged. Shared by the Events component and the RSS feed.
 */
export function resolveEventDate(event: CollectionEntry<'events'>): CollectionEntry<'events'> {
  if (event.data.recurring === 'monthly-second-tuesday') {
    return { ...event, data: { ...event.data, date: nextSecondTuesday(event.data.time, event.data.recurringStartAfter) } };
  }
  return event;
}
