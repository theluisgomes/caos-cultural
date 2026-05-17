/**
 * CAOS domain model.
 *
 * Each aggregate exports a `zod` schema (PascalCase constant) AND a
 * TypeScript type of the same name, inferred from the schema. Import
 * style:
 *
 *   import { Event, type Event as EventT } from '@/domain';
 *
 * (The constant and the type share a name; TS disambiguates by position.)
 *
 * These schemas are the source of truth for Firestore shapes (Phase 0.3+).
 * The legacy `src/types.ts` is deprecated and will be removed once all
 * components are migrated in Phases 1 and 2.
 */

export * from './common';
export * from './user';
export * from './agent';
export * from './space';
export * from './event';
export * from './work';
export * from './list';
export * from './agenda';
export * from './interaction';
export * from './verification';
export * from './boost';
export * from './feed';
