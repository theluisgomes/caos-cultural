import { AllCulturalListingsData, MyFavoriteCulturalListingsData, CreateCulturalListingData, CreateCulturalListingVariables, AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAllCulturalListings(options?: useDataConnectQueryOptions<AllCulturalListingsData>): UseDataConnectQueryResult<AllCulturalListingsData, undefined>;
export function useAllCulturalListings(dc: DataConnect, options?: useDataConnectQueryOptions<AllCulturalListingsData>): UseDataConnectQueryResult<AllCulturalListingsData, undefined>;

export function useMyFavoriteCulturalListings(options?: useDataConnectQueryOptions<MyFavoriteCulturalListingsData>): UseDataConnectQueryResult<MyFavoriteCulturalListingsData, undefined>;
export function useMyFavoriteCulturalListings(dc: DataConnect, options?: useDataConnectQueryOptions<MyFavoriteCulturalListingsData>): UseDataConnectQueryResult<MyFavoriteCulturalListingsData, undefined>;

export function useCreateCulturalListing(options?: useDataConnectMutationOptions<CreateCulturalListingData, FirebaseError, CreateCulturalListingVariables>): UseDataConnectMutationResult<CreateCulturalListingData, CreateCulturalListingVariables>;
export function useCreateCulturalListing(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCulturalListingData, FirebaseError, CreateCulturalListingVariables>): UseDataConnectMutationResult<CreateCulturalListingData, CreateCulturalListingVariables>;

export function useAddCulturalListingToFavorites(options?: useDataConnectMutationOptions<AddCulturalListingToFavoritesData, FirebaseError, AddCulturalListingToFavoritesVariables>): UseDataConnectMutationResult<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
export function useAddCulturalListingToFavorites(dc: DataConnect, options?: useDataConnectMutationOptions<AddCulturalListingToFavoritesData, FirebaseError, AddCulturalListingToFavoritesVariables>): UseDataConnectMutationResult<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
