import { z } from 'zod';
import { Agent } from './agent';
import { Event } from './event';
import { Space } from './space';
import { Work } from './work';

/**
 * FeedItem is the polymorphic envelope used by the mixed Discovery feed
 * (analysis 5.1). Each item wraps one of the four first-class entities
 * plus metadata about why it was shown (ranking explanation, boost flag).
 */

export const FeedItemKind = z.enum(['event', 'agent', 'space', 'work']);
export type FeedItemKind = z.infer<typeof FeedItemKind>;

export const FeedReason = z.enum([
  'algorithmic',
  'following',
  'nearby',
  'trending',
  'boosted',
  'fresh',
  'similar_to_saved',
  'editorial',
]);
export type FeedReason = z.infer<typeof FeedReason>;

const FeedItemBase = z.object({
  id: z.string(),
  reason: FeedReason.default('algorithmic'),
  score: z.number().default(0),
  boostId: z.string().nullable(),
});

export const EventFeedItem = FeedItemBase.extend({
  kind: z.literal('event'),
  data: Event,
});
export type EventFeedItem = z.infer<typeof EventFeedItem>;

export const AgentFeedItem = FeedItemBase.extend({
  kind: z.literal('agent'),
  data: Agent,
});
export type AgentFeedItem = z.infer<typeof AgentFeedItem>;

export const SpaceFeedItem = FeedItemBase.extend({
  kind: z.literal('space'),
  data: Space,
});
export type SpaceFeedItem = z.infer<typeof SpaceFeedItem>;

export const WorkFeedItem = FeedItemBase.extend({
  kind: z.literal('work'),
  data: Work,
});
export type WorkFeedItem = z.infer<typeof WorkFeedItem>;

export const FeedItem = z.discriminatedUnion('kind', [
  EventFeedItem,
  AgentFeedItem,
  SpaceFeedItem,
  WorkFeedItem,
]);
export type FeedItem = z.infer<typeof FeedItem>;

/**
 * Search filter state used by the Active Search mode (analysis 1.2, 2.3, 3.2).
 * Serializable so it can live in URL query params.
 */
export const SearchFilters = z.object({
  kinds: z.array(FeedItemKind).default([]),
  city: z.string().nullable(),
  neighborhood: z.string().nullable(),
  radiusKm: z.number().positive().nullable(),
  dateFrom: z.string().nullable(),
  dateTo: z.string().nullable(),
  categories: z.array(z.string()).default([]),
  disciplines: z.array(z.string()).default([]),
  techniques: z.array(z.string()).default([]),
  agentKinds: z.array(z.string()).default([]),
  ageRanges: z.array(z.string()).default([]),
  genders: z.array(z.string()).default([]),
  races: z.array(z.string()).default([]),
  spaceKinds: z.array(z.string()).default([]),
  eventKinds: z.array(z.string()).default([]),
  priceMax: z.number().nonnegative().nullable(),
  query: z.string().default(''),
});
export type SearchFilters = z.infer<typeof SearchFilters>;
