export enum ListingType {
  EVENT = 'EVENT',
  SPACE = 'SPACE',
  ARTIST = 'ARTIST',
  EXPERIENCE = 'EXPERIENCE'
}

export type ViewState = 'HOME' | 'PROFILE' | 'ONBOARDING' | 'EDIT_PROFILE' | 'LISTING_DETAILS';

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
  disciplines: string[]; // e.g. ['Photography', 'DJ', 'Visual Arts']
  stats: UserStats;
  socialLinks?: {
    instagram?: string;
    portfolio?: string;
  };
  joinDate: string;
}

export interface Listing {
  id: string;
  authorId?: string; // FK to User
  type: ListingType;
  title: string;
  subtitle: string; // Location for events/spaces, Profession for artists
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
  icon: string; // lucide icon name representation
}

export interface FilterState {
  category: string;
  searchQuery: string;
  viewMode: 'grid' | 'map';
}