/**
 * @deprecated These types are UI DTOs for prototype-era components
 * (`ListingCard`, `UserDashboard`, etc.). Firestore shapes live in `src/domain/`.
 *
 * - `Listing` — feed/card DTO produced by `services/mappers.ts` (not stored).
 * - `UserProfile` — UI view of `User` + optional `Agent` (see `userMappers.ts`).
 *
 * Do NOT add new Firestore fields here. Add them to `src/domain/` instead.
 */

export enum ListingType {
  EVENT = 'EVENT',
  SPACE = 'SPACE',
  ARTIST = 'ARTIST',
  EXPERIENCE = 'EXPERIENCE',
  WORK = 'WORK',
}

export interface UserStats {
  followers: number;
  following: number;
  eventsAttended: number;
  projectsCreated: number;
}

/** Persona label for UI filters / badges (maps from Agent.kind). */
export type PersonaUiRole = 'ARTIST' | 'ORGANIZER' | 'VISITOR' | 'SUPER_ADMIN';

export type PlatformRole = 'member' | 'admin' | 'moderator' | 'super_admin';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  handle: string;
  /** @deprecated Prefer `agentKind` — kept for UI filters. */
  role: PersonaUiRole;
  bio: string;
  location: string;
  avatarUrl: string;
  coverUrl: string;
  disciplines: string[];
  stats: UserStats;
  socialLinks?: {
    instagram?: string;
    portfolio?: string;
  };
  joinDate: string;
  agentId?: string | null;
  agentKind?: string | null;
  platformRole?: PlatformRole;
}

export interface Listing {
  id: string;
  authorId?: string;
  type: ListingType;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  /** Cover image for a related work (hybrid artist cards). */
  workImageUrl?: string;
  price?: string;
  rating: number;
  reviews: number;
  date?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags: string[];
  /** Filter/ranking metadata from domain entities. */
  meta?: {
    agentKind?: string;
    city?: string;
    neighborhood?: string;
    spaceKind?: string;
    eventKind?: string;
    startsAt?: string;
    priceBRL?: number | null;
    /** How the card image was resolved (event → street → branded). */
    imageSource?: 'event' | 'street' | 'branded' | 'place' | 'neighborhood' | 'city' | 'fallback';
    identity?: {
      ageRange?: string | null;
      gender?: string | null;
      race?: string | null;
      sexuality?: string | null;
    };
  };
  sponsored?: boolean;
}
