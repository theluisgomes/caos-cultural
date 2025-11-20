export enum ListingType {
  EVENT = 'EVENT',
  SPACE = 'SPACE',
  ARTIST = 'ARTIST',
  EXPERIENCE = 'EXPERIENCE'
}

export interface Listing {
  id: string;
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
