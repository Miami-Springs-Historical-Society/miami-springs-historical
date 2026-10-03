import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parseStartTime } from './utils/events';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string().min(1, 'Event title is required'),
    date: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    time: z.string().optional(),
    location: z.string().min(1, 'Event location is required'),
    price: z.string().optional(),
    recurring: z.enum(['monthly-second-tuesday']).optional(),
    recurringStartAfter: z.coerce.date().optional(),
  }).refine(
    data => data.recurring || data.date,
    { message: 'Either "date" or "recurring" must be set on every event' }
  ).refine(
    data => !data.recurring || parseStartTime(data.time),
    { message: 'Recurring events need a "time" the site can read, like "4:30 PM"', path: ['time'] }
  ),
});

const board = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/board' }),
  schema: z.object({
    name: z.string().optional(),
    role: z.string(),
    photo: z.string().optional(),
    order: z.number().default(99),
    vacant: z.boolean().default(false),
  }),
});

export const collections = { events, board };
