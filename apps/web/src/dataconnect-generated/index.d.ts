import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddCulturalListingToFavoritesData {
  favorite_insert: Favorite_Key;
}

export interface AddCulturalListingToFavoritesVariables {
  listingId: UUIDString;
}

export interface AllCulturalListingsData {
  culturalListings: ({
    id: UUIDString;
    title: string;
    description: string;
    type: string;
    locationName: string;
    latitude: number;
    longitude: number;
    startDate?: DateString | null;
    endDate?: DateString | null;
    startTime?: string | null;
    endTime?: string | null;
    priceRange?: string | null;
    categories?: string[] | null;
    imageUrl?: string | null;
    website?: string | null;
    contactEmail?: string | null;
    creator?: {
      id: UUIDString;
      displayName: string;
      email: string;
    } & User_Key;
  } & CulturalListing_Key)[];
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateCulturalListingData {
  culturalListing_insert: CulturalListing_Key;
}

export interface CreateCulturalListingVariables {
  title: string;
  description: string;
  type: string;
  locationName: string;
  latitude: number;
  longitude: number;
  startDate?: DateString | null;
  endDate?: DateString | null;
  startTime?: string | null;
  endTime?: string | null;
  priceRange?: string | null;
  categories?: string[] | null;
  imageUrl?: string | null;
  website?: string | null;
  contactEmail?: string | null;
}

export interface CulturalListing_Key {
  id: UUIDString;
  __typename?: 'CulturalListing_Key';
}

export interface Favorite_Key {
  userId: UUIDString;
  listingId: UUIDString;
  __typename?: 'Favorite_Key';
}

export interface MyFavoriteCulturalListingsData {
  favorites: ({
    listing: {
      id: UUIDString;
      title: string;
      locationName: string;
      type: string;
      startDate?: DateString | null;
    } & CulturalListing_Key;
      createdAt: TimestampString;
  })[];
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface AllCulturalListingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AllCulturalListingsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AllCulturalListingsData, undefined>;
  operationName: string;
}
export const allCulturalListingsRef: AllCulturalListingsRef;

export function allCulturalListings(options?: ExecuteQueryOptions): QueryPromise<AllCulturalListingsData, undefined>;
export function allCulturalListings(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AllCulturalListingsData, undefined>;

interface MyFavoriteCulturalListingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyFavoriteCulturalListingsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<MyFavoriteCulturalListingsData, undefined>;
  operationName: string;
}
export const myFavoriteCulturalListingsRef: MyFavoriteCulturalListingsRef;

export function myFavoriteCulturalListings(options?: ExecuteQueryOptions): QueryPromise<MyFavoriteCulturalListingsData, undefined>;
export function myFavoriteCulturalListings(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyFavoriteCulturalListingsData, undefined>;

interface CreateCulturalListingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCulturalListingVariables): MutationRef<CreateCulturalListingData, CreateCulturalListingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCulturalListingVariables): MutationRef<CreateCulturalListingData, CreateCulturalListingVariables>;
  operationName: string;
}
export const createCulturalListingRef: CreateCulturalListingRef;

export function createCulturalListing(vars: CreateCulturalListingVariables): MutationPromise<CreateCulturalListingData, CreateCulturalListingVariables>;
export function createCulturalListing(dc: DataConnect, vars: CreateCulturalListingVariables): MutationPromise<CreateCulturalListingData, CreateCulturalListingVariables>;

interface AddCulturalListingToFavoritesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCulturalListingToFavoritesVariables): MutationRef<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCulturalListingToFavoritesVariables): MutationRef<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
  operationName: string;
}
export const addCulturalListingToFavoritesRef: AddCulturalListingToFavoritesRef;

export function addCulturalListingToFavorites(vars: AddCulturalListingToFavoritesVariables): MutationPromise<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
export function addCulturalListingToFavorites(dc: DataConnect, vars: AddCulturalListingToFavoritesVariables): MutationPromise<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;

