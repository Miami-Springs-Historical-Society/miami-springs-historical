import type { CollectionEntry } from 'astro:content';

/**
 * Returns the next occurrence of the second Tuesday of a month at 4:30 PM local time
 * (the meeting time in src/content/events/monthly-membership-meeting.md).
 *
 * NOTE: This function is intentionally mirrored in the client-side <script> block of
 * Events.astro so that stale static builds auto-update recurring dates without a redeploy.
 * If you change this logic, update the copy in Events.astro too.
 */
export function nextSecondTuesday(startAfter?: Date): Date {
  const after = startAfter && startAfter > new Date() ? startAfter : new Date();
  for (let offset = 0; offset <= 3; offset++) {
    const year = after.getFullYear() + Math.floor((after.getMonth() + offset) / 12);
    const month = (after.getMonth() + offset) % 12;
    const first = new Date(year, month, 1);
    const daysUntilTuesday = (2 - first.getDay() + 7) % 7;
    const secondTuesday = new Date(year, month, 1 + daysUntilTuesday + 7, 16, 30, 0);
    if (secondTuesday > after) return secondTuesday;
  }
  const next = new Date(after.getFullYear(), after.getMonth() + 1, 1);
  const daysUntilTuesday = (2 - next.getDay() + 7) % 7;
  return new Date(next.getFullYear(), next.getMonth(), 1 + daysUntilTuesday + 7, 16, 30, 0);
}

/**
 * Resolves a recurring event to its next concrete occurrence date, leaving
 * one-time events unchanged. Shared by the Events component and the RSS feed.
 */
export function resolveEventDate(event: CollectionEntry<'events'>): CollectionEntry<'events'> {
  if (event.data.recurring === 'monthly-second-tuesday') {
    return { ...event, data: { ...event.data, date: nextSecondTuesday(event.data.recurringStartAfter) } };
  }
  return event;
}
