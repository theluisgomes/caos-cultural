/**
 * @deprecated These types are the prototype-era shapes used by the current
 * UI components (`ListingCard`, `UserDashboard`, etc.). The authoritative
 * domain model lives in `src/domain/` and will replace these types as
 * components are migrated in Phases 1 and 2.
 *
 * Do NOT add new types here. Add them to `src/domain/` instead.
 */

export enum ListingType {
  EVENT = 'EVENT',
  SPACE = 'SPACE',
  ARTIST = 'ARTIST',
  EXPERIENCE = 'EXPERIENCE'
}

export interface UserStats {
  followers: number;
  following: number;
  eventsAttended: number;
  projectsCreated: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  handle: string;
  role: 'ARTIST' | 'ORGANIZER' | 'VISITOR';
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
}

export interface Listing {
  id: string;
  authorId?: string;
  type: ListingType;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  price?: string;
  rating: number;
  reviews: number;
  date?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags: string[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface FilterState {
  category: string;
  searchQuery: string;
  viewMode: 'grid' | 'map';
}
