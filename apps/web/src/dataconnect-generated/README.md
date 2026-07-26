# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*AllCulturalListings*](#allculturallistings)
  - [*MyFavoriteCulturalListings*](#myfavoriteculturallistings)
- [**Mutations**](#mutations)
  - [*CreateCulturalListing*](#createculturallisting)
  - [*AddCulturalListingToFavorites*](#addculturallistingtofavorites)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## AllCulturalListings
You can execute the `AllCulturalListings` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
allCulturalListings(options?: ExecuteQueryOptions): QueryPromise<AllCulturalListingsData, undefined>;

interface AllCulturalListingsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AllCulturalListingsData, undefined>;
}
export const allCulturalListingsRef: AllCulturalListingsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
allCulturalListings(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<AllCulturalListingsData, undefined>;

interface AllCulturalListingsRef {
  ...
  (dc: DataConnect): QueryRef<AllCulturalListingsData, undefined>;
}
export const allCulturalListingsRef: AllCulturalListingsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the allCulturalListingsRef:
```typescript
const name = allCulturalListingsRef.operationName;
console.log(name);
```

### Variables
The `AllCulturalListings` query has no variables.
### Return Type
Recall that executing the `AllCulturalListings` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AllCulturalListingsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `AllCulturalListings`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, allCulturalListings } from '@dataconnect/generated';


// Call the `allCulturalListings()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await allCulturalListings();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await allCulturalListings(dataConnect);

console.log(data.culturalListings);

// Or, you can use the `Promise` API.
allCulturalListings().then((response) => {
  const data = response.data;
  console.log(data.culturalListings);
});
```

### Using `AllCulturalListings`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, allCulturalListingsRef } from '@dataconnect/generated';


// Call the `allCulturalListingsRef()` function to get a reference to the query.
const ref = allCulturalListingsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = allCulturalListingsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.culturalListings);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.culturalListings);
});
```

## MyFavoriteCulturalListings
You can execute the `MyFavoriteCulturalListings` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
myFavoriteCulturalListings(options?: ExecuteQueryOptions): QueryPromise<MyFavoriteCulturalListingsData, undefined>;

interface MyFavoriteCulturalListingsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<MyFavoriteCulturalListingsData, undefined>;
}
export const myFavoriteCulturalListingsRef: MyFavoriteCulturalListingsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
myFavoriteCulturalListings(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<MyFavoriteCulturalListingsData, undefined>;

interface MyFavoriteCulturalListingsRef {
  ...
  (dc: DataConnect): QueryRef<MyFavoriteCulturalListingsData, undefined>;
}
export const myFavoriteCulturalListingsRef: MyFavoriteCulturalListingsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the myFavoriteCulturalListingsRef:
```typescript
const name = myFavoriteCulturalListingsRef.operationName;
console.log(name);
```

### Variables
The `MyFavoriteCulturalListings` query has no variables.
### Return Type
Recall that executing the `MyFavoriteCulturalListings` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MyFavoriteCulturalListingsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `MyFavoriteCulturalListings`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, myFavoriteCulturalListings } from '@dataconnect/generated';


// Call the `myFavoriteCulturalListings()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await myFavoriteCulturalListings();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await myFavoriteCulturalListings(dataConnect);

console.log(data.favorites);

// Or, you can use the `Promise` API.
myFavoriteCulturalListings().then((response) => {
  const data = response.data;
  console.log(data.favorites);
});
```

### Using `MyFavoriteCulturalListings`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, myFavoriteCulturalListingsRef } from '@dataconnect/generated';


// Call the `myFavoriteCulturalListingsRef()` function to get a reference to the query.
const ref = myFavoriteCulturalListingsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = myFavoriteCulturalListingsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.favorites);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.favorites);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateCulturalListing
You can execute the `CreateCulturalListing` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCulturalListing(vars: CreateCulturalListingVariables): MutationPromise<CreateCulturalListingData, CreateCulturalListingVariables>;

interface CreateCulturalListingRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCulturalListingVariables): MutationRef<CreateCulturalListingData, CreateCulturalListingVariables>;
}
export const createCulturalListingRef: CreateCulturalListingRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCulturalListing(dc: DataConnect, vars: CreateCulturalListingVariables): MutationPromise<CreateCulturalListingData, CreateCulturalListingVariables>;

interface CreateCulturalListingRef {
  ...
  (dc: DataConnect, vars: CreateCulturalListingVariables): MutationRef<CreateCulturalListingData, CreateCulturalListingVariables>;
}
export const createCulturalListingRef: CreateCulturalListingRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCulturalListingRef:
```typescript
const name = createCulturalListingRef.operationName;
console.log(name);
```

### Variables
The `CreateCulturalListing` mutation requires an argument of type `CreateCulturalListingVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateCulturalListing` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCulturalListingData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCulturalListingData {
  culturalListing_insert: CulturalListing_Key;
}
```
### Using `CreateCulturalListing`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCulturalListing, CreateCulturalListingVariables } from '@dataconnect/generated';

// The `CreateCulturalListing` mutation requires an argument of type `CreateCulturalListingVariables`:
const createCulturalListingVars: CreateCulturalListingVariables = {
  title: ..., 
  description: ..., 
  type: ..., 
  locationName: ..., 
  latitude: ..., 
  longitude: ..., 
  startDate: ..., // optional
  endDate: ..., // optional
  startTime: ..., // optional
  endTime: ..., // optional
  priceRange: ..., // optional
  categories: ..., // optional
  imageUrl: ..., // optional
  website: ..., // optional
  contactEmail: ..., // optional
};

// Call the `createCulturalListing()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCulturalListing(createCulturalListingVars);
// Variables can be defined inline as well.
const { data } = await createCulturalListing({ title: ..., description: ..., type: ..., locationName: ..., latitude: ..., longitude: ..., startDate: ..., endDate: ..., startTime: ..., endTime: ..., priceRange: ..., categories: ..., imageUrl: ..., website: ..., contactEmail: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCulturalListing(dataConnect, createCulturalListingVars);

console.log(data.culturalListing_insert);

// Or, you can use the `Promise` API.
createCulturalListing(createCulturalListingVars).then((response) => {
  const data = response.data;
  console.log(data.culturalListing_insert);
});
```

### Using `CreateCulturalListing`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCulturalListingRef, CreateCulturalListingVariables } from '@dataconnect/generated';

// The `CreateCulturalListing` mutation requires an argument of type `CreateCulturalListingVariables`:
const createCulturalListingVars: CreateCulturalListingVariables = {
  title: ..., 
  description: ..., 
  type: ..., 
  locationName: ..., 
  latitude: ..., 
  longitude: ..., 
  startDate: ..., // optional
  endDate: ..., // optional
  startTime: ..., // optional
  endTime: ..., // optional
  priceRange: ..., // optional
  categories: ..., // optional
  imageUrl: ..., // optional
  website: ..., // optional
  contactEmail: ..., // optional
};

// Call the `createCulturalListingRef()` function to get a reference to the mutation.
const ref = createCulturalListingRef(createCulturalListingVars);
// Variables can be defined inline as well.
const ref = createCulturalListingRef({ title: ..., description: ..., type: ..., locationName: ..., latitude: ..., longitude: ..., startDate: ..., endDate: ..., startTime: ..., endTime: ..., priceRange: ..., categories: ..., imageUrl: ..., website: ..., contactEmail: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCulturalListingRef(dataConnect, createCulturalListingVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.culturalListing_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.culturalListing_insert);
});
```

## AddCulturalListingToFavorites
You can execute the `AddCulturalListingToFavorites` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addCulturalListingToFavorites(vars: AddCulturalListingToFavoritesVariables): MutationPromise<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;

interface AddCulturalListingToFavoritesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCulturalListingToFavoritesVariables): MutationRef<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
}
export const addCulturalListingToFavoritesRef: AddCulturalListingToFavoritesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addCulturalListingToFavorites(dc: DataConnect, vars: AddCulturalListingToFavoritesVariables): MutationPromise<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;

interface AddCulturalListingToFavoritesRef {
  ...
  (dc: DataConnect, vars: AddCulturalListingToFavoritesVariables): MutationRef<AddCulturalListingToFavoritesData, AddCulturalListingToFavoritesVariables>;
}
export const addCulturalListingToFavoritesRef: AddCulturalListingToFavoritesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addCulturalListingToFavoritesRef:
```typescript
const name = addCulturalListingToFavoritesRef.operationName;
console.log(name);
```

### Variables
The `AddCulturalListingToFavorites` mutation requires an argument of type `AddCulturalListingToFavoritesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddCulturalListingToFavoritesVariables {
  listingId: UUIDString;
}
```
### Return Type
Recall that executing the `AddCulturalListingToFavorites` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCulturalListingToFavoritesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCulturalListingToFavoritesData {
  favorite_insert: Favorite_Key;
}
```
### Using `AddCulturalListingToFavorites`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addCulturalListingToFavorites, AddCulturalListingToFavoritesVariables } from '@dataconnect/generated';

// The `AddCulturalListingToFavorites` mutation requires an argument of type `AddCulturalListingToFavoritesVariables`:
const addCulturalListingToFavoritesVars: AddCulturalListingToFavoritesVariables = {
  listingId: ..., 
};

// Call the `addCulturalListingToFavorites()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addCulturalListingToFavorites(addCulturalListingToFavoritesVars);
// Variables can be defined inline as well.
const { data } = await addCulturalListingToFavorites({ listingId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addCulturalListingToFavorites(dataConnect, addCulturalListingToFavoritesVars);

console.log(data.favorite_insert);

// Or, you can use the `Promise` API.
addCulturalListingToFavorites(addCulturalListingToFavoritesVars).then((response) => {
  const data = response.data;
  console.log(data.favorite_insert);
});
```

### Using `AddCulturalListingToFavorites`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addCulturalListingToFavoritesRef, AddCulturalListingToFavoritesVariables } from '@dataconnect/generated';

// The `AddCulturalListingToFavorites` mutation requires an argument of type `AddCulturalListingToFavoritesVariables`:
const addCulturalListingToFavoritesVars: AddCulturalListingToFavoritesVariables = {
  listingId: ..., 
};

// Call the `addCulturalListingToFavoritesRef()` function to get a reference to the mutation.
const ref = addCulturalListingToFavoritesRef(addCulturalListingToFavoritesVars);
// Variables can be defined inline as well.
const ref = addCulturalListingToFavoritesRef({ listingId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCulturalListingToFavoritesRef(dataConnect, addCulturalListingToFavoritesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.favorite_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.favorite_insert);
});
```

