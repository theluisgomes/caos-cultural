import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * User interactions that feed the algorithm (analysis section 6).
 * Writes are mirrored to BigQuery via a Cloud Function trigger (Phase 6)
 * for ranking and anomaly detection.
 */

export const InteractionKind = z.enum([
  'like',
  'unlike',
  'save',
  'unsave',
  'ignore',
  'visit',
  'share',
  'follow',
  'unfollow',
  'rsvp_interested',
  'rsvp_going',
  'attended',
  'boost_seen',
  'boost_click',
]);
export type InteractionKind = z.infer<typeof InteractionKind>;

export const InteractionTargetType = z.enum([
  'event',
  'space',
  'agent',
  'work',
  'user',
  'list',
  'agenda',
]);
export type InteractionTargetType = z.infer<typeof InteractionTargetType>;

export const FeedSurface = z.enum([
  'discover_mixed',
  'discover_events',
  'discover_agents',
  'discover_spaces',
  'discover_works',
  'search',
  'profile',
  'space_page',
  'event_page',
  'agent_page',
  'map',
  'boost',
  'external',
]);
export type FeedSurface = z.infer<typeof FeedSurface>;

export const Interaction = z.object({
  id: Id,
  actorUserId: Id,
  kind: InteractionKind,
  targetType: InteractionTargetType,
  targetId: Id,
  surface: FeedSurface.default('discover_mixed'),
  dwellMs: z.number().int().nonnegative().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: IsoDate,
});
export type Interaction = z.infer<typeof Interaction>;

/**
 * Denormalized follow edge for quick graph traversal.
 * Written by a Cloud Function when a follow Interaction is recorded.
 */
export const Follow = z.object({
  id: Id,
  followerUserId: Id,
  targetType: z.enum(['agent', 'space', 'user']),
  targetId: Id,
  createdAt: IsoDate,
});
export type Follow = z.infer<typeof Follow>;
