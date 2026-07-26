const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'caos-cultural',
  location: 'southamerica-west1'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const allCulturalListingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AllCulturalListings');
}
allCulturalListingsRef.operationName = 'AllCulturalListings';
exports.allCulturalListingsRef = allCulturalListingsRef;

exports.allCulturalListings = function allCulturalListings(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(allCulturalListingsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const myFavoriteCulturalListingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'MyFavoriteCulturalListings');
}
myFavoriteCulturalListingsRef.operationName = 'MyFavoriteCulturalListings';
exports.myFavoriteCulturalListingsRef = myFavoriteCulturalListingsRef;

exports.myFavoriteCulturalListings = function myFavoriteCulturalListings(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(myFavoriteCulturalListingsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createCulturalListingRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCulturalListing', inputVars);
}
createCulturalListingRef.operationName = 'CreateCulturalListing';
exports.createCulturalListingRef = createCulturalListingRef;

exports.createCulturalListing = function createCulturalListing(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCulturalListingRef(dcInstance, inputVars));
}
;

const addCulturalListingToFavoritesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCulturalListingToFavorites', inputVars);
}
addCulturalListingToFavoritesRef.operationName = 'AddCulturalListingToFavorites';
exports.addCulturalListingToFavoritesRef = addCulturalListingToFavoritesRef;

exports.addCulturalListingToFavorites = function addCulturalListingToFavorites(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(addCulturalListingToFavoritesRef(dcInstance, inputVars));
}
;
