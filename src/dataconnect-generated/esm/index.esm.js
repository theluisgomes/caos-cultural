import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'caos-cultural',
  location: 'southamerica-west1'
};
export const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
export const allCulturalListingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AllCulturalListings');
}
allCulturalListingsRef.operationName = 'AllCulturalListings';

export function allCulturalListings(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(allCulturalListingsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const myFavoriteCulturalListingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyFavoriteCulturalListings');
}
myFavoriteCulturalListingsRef.operationName = 'MyFavoriteCulturalListings';

export function myFavoriteCulturalListings(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myFavoriteCulturalListingsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const createCulturalListingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCulturalListing', inputVars);
}
createCulturalListingRef.operationName = 'CreateCulturalListing';

export function createCulturalListing(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCulturalListingRef(dcInstance, inputVars));
}

export const addCulturalListingToFavoritesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCulturalListingToFavorites', inputVars);
}
addCulturalListingToFavoritesRef.operationName = 'AddCulturalListingToFavorites';

export function addCulturalListingToFavorites(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addCulturalListingToFavoritesRef(dcInstance, inputVars));
}

