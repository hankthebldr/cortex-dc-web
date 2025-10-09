# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListEngagements*](#listengagements)
  - [*ListResourceRequestsForUser*](#listresourcerequestsforuser)
- [**Mutations**](#mutations)
  - [*CreateNewEngagement*](#createnewengagement)
  - [*AssignUserToEngagement*](#assignusertoengagement)
  - [*CreateUser*](#createuser)
  - [*CreateTechnicalResource*](#createtechnicalresource)
  - [*CreateResourceRequest*](#createresourcerequest)
  - [*CreateActivityLog*](#createactivitylog)

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

## ListEngagements
You can execute the `ListEngagements` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listEngagements(): QueryPromise<ListEngagementsData, undefined>;

interface ListEngagementsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEngagementsData, undefined>;
}
export const listEngagementsRef: ListEngagementsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEngagements(dc: DataConnect): QueryPromise<ListEngagementsData, undefined>;

interface ListEngagementsRef {
  ...
  (dc: DataConnect): QueryRef<ListEngagementsData, undefined>;
}
export const listEngagementsRef: ListEngagementsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEngagementsRef:
```typescript
const name = listEngagementsRef.operationName;
console.log(name);
```

### Variables
The `ListEngagements` query has no variables.
### Return Type
Recall that executing the `ListEngagements` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEngagementsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListEngagementsData {
  engagements: ({
    id: UUIDString;
    name: string;
    startDate: DateString;
    endDate: DateString;
    status: string;
  } & Engagement_Key)[];
}
```
### Using `ListEngagements`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEngagements } from '@dataconnect/generated';


// Call the `listEngagements()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEngagements();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEngagements(dataConnect);

console.log(data.engagements);

// Or, you can use the `Promise` API.
listEngagements().then((response) => {
  const data = response.data;
  console.log(data.engagements);
});
```

### Using `ListEngagements`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEngagementsRef } from '@dataconnect/generated';


// Call the `listEngagementsRef()` function to get a reference to the query.
const ref = listEngagementsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEngagementsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.engagements);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.engagements);
});
```

## ListResourceRequestsForUser
You can execute the `ListResourceRequestsForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listResourceRequestsForUser(vars: ListResourceRequestsForUserVariables): QueryPromise<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;

interface ListResourceRequestsForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListResourceRequestsForUserVariables): QueryRef<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;
}
export const listResourceRequestsForUserRef: ListResourceRequestsForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listResourceRequestsForUser(dc: DataConnect, vars: ListResourceRequestsForUserVariables): QueryPromise<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;

interface ListResourceRequestsForUserRef {
  ...
  (dc: DataConnect, vars: ListResourceRequestsForUserVariables): QueryRef<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;
}
export const listResourceRequestsForUserRef: ListResourceRequestsForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listResourceRequestsForUserRef:
```typescript
const name = listResourceRequestsForUserRef.operationName;
console.log(name);
```

### Variables
The `ListResourceRequestsForUser` query requires an argument of type `ListResourceRequestsForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListResourceRequestsForUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListResourceRequestsForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListResourceRequestsForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListResourceRequestsForUserData {
  resourceRequests: ({
    id: UUIDString;
    technicalResource?: {
      name: string;
      type: string;
    };
      quantity: number;
      status: string;
  } & ResourceRequest_Key)[];
}
```
### Using `ListResourceRequestsForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listResourceRequestsForUser, ListResourceRequestsForUserVariables } from '@dataconnect/generated';

// The `ListResourceRequestsForUser` query requires an argument of type `ListResourceRequestsForUserVariables`:
const listResourceRequestsForUserVars: ListResourceRequestsForUserVariables = {
  userId: ..., 
};

// Call the `listResourceRequestsForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listResourceRequestsForUser(listResourceRequestsForUserVars);
// Variables can be defined inline as well.
const { data } = await listResourceRequestsForUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listResourceRequestsForUser(dataConnect, listResourceRequestsForUserVars);

console.log(data.resourceRequests);

// Or, you can use the `Promise` API.
listResourceRequestsForUser(listResourceRequestsForUserVars).then((response) => {
  const data = response.data;
  console.log(data.resourceRequests);
});
```

### Using `ListResourceRequestsForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listResourceRequestsForUserRef, ListResourceRequestsForUserVariables } from '@dataconnect/generated';

// The `ListResourceRequestsForUser` query requires an argument of type `ListResourceRequestsForUserVariables`:
const listResourceRequestsForUserVars: ListResourceRequestsForUserVariables = {
  userId: ..., 
};

// Call the `listResourceRequestsForUserRef()` function to get a reference to the query.
const ref = listResourceRequestsForUserRef(listResourceRequestsForUserVars);
// Variables can be defined inline as well.
const ref = listResourceRequestsForUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listResourceRequestsForUserRef(dataConnect, listResourceRequestsForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.resourceRequests);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.resourceRequests);
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

## CreateNewEngagement
You can execute the `CreateNewEngagement` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewEngagement(vars: CreateNewEngagementVariables): MutationPromise<CreateNewEngagementData, CreateNewEngagementVariables>;

interface CreateNewEngagementRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewEngagementVariables): MutationRef<CreateNewEngagementData, CreateNewEngagementVariables>;
}
export const createNewEngagementRef: CreateNewEngagementRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewEngagement(dc: DataConnect, vars: CreateNewEngagementVariables): MutationPromise<CreateNewEngagementData, CreateNewEngagementVariables>;

interface CreateNewEngagementRef {
  ...
  (dc: DataConnect, vars: CreateNewEngagementVariables): MutationRef<CreateNewEngagementData, CreateNewEngagementVariables>;
}
export const createNewEngagementRef: CreateNewEngagementRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewEngagementRef:
```typescript
const name = createNewEngagementRef.operationName;
console.log(name);
```

### Variables
The `CreateNewEngagement` mutation requires an argument of type `CreateNewEngagementVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewEngagementVariables {
  clientName?: string | null;
  description?: string | null;
  endDate: DateString;
  name: string;
  startDate: DateString;
  status: string;
  createdAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateNewEngagement` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewEngagementData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewEngagementData {
  engagement_insert: Engagement_Key;
}
```
### Using `CreateNewEngagement`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewEngagement, CreateNewEngagementVariables } from '@dataconnect/generated';

// The `CreateNewEngagement` mutation requires an argument of type `CreateNewEngagementVariables`:
const createNewEngagementVars: CreateNewEngagementVariables = {
  clientName: ..., // optional
  description: ..., // optional
  endDate: ..., 
  name: ..., 
  startDate: ..., 
  status: ..., 
  createdAt: ..., 
};

// Call the `createNewEngagement()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewEngagement(createNewEngagementVars);
// Variables can be defined inline as well.
const { data } = await createNewEngagement({ clientName: ..., description: ..., endDate: ..., name: ..., startDate: ..., status: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewEngagement(dataConnect, createNewEngagementVars);

console.log(data.engagement_insert);

// Or, you can use the `Promise` API.
createNewEngagement(createNewEngagementVars).then((response) => {
  const data = response.data;
  console.log(data.engagement_insert);
});
```

### Using `CreateNewEngagement`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewEngagementRef, CreateNewEngagementVariables } from '@dataconnect/generated';

// The `CreateNewEngagement` mutation requires an argument of type `CreateNewEngagementVariables`:
const createNewEngagementVars: CreateNewEngagementVariables = {
  clientName: ..., // optional
  description: ..., // optional
  endDate: ..., 
  name: ..., 
  startDate: ..., 
  status: ..., 
  createdAt: ..., 
};

// Call the `createNewEngagementRef()` function to get a reference to the mutation.
const ref = createNewEngagementRef(createNewEngagementVars);
// Variables can be defined inline as well.
const ref = createNewEngagementRef({ clientName: ..., description: ..., endDate: ..., name: ..., startDate: ..., status: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewEngagementRef(dataConnect, createNewEngagementVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.engagement_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.engagement_insert);
});
```

## AssignUserToEngagement
You can execute the `AssignUserToEngagement` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
assignUserToEngagement(vars: AssignUserToEngagementVariables): MutationPromise<AssignUserToEngagementData, AssignUserToEngagementVariables>;

interface AssignUserToEngagementRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignUserToEngagementVariables): MutationRef<AssignUserToEngagementData, AssignUserToEngagementVariables>;
}
export const assignUserToEngagementRef: AssignUserToEngagementRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
assignUserToEngagement(dc: DataConnect, vars: AssignUserToEngagementVariables): MutationPromise<AssignUserToEngagementData, AssignUserToEngagementVariables>;

interface AssignUserToEngagementRef {
  ...
  (dc: DataConnect, vars: AssignUserToEngagementVariables): MutationRef<AssignUserToEngagementData, AssignUserToEngagementVariables>;
}
export const assignUserToEngagementRef: AssignUserToEngagementRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the assignUserToEngagementRef:
```typescript
const name = assignUserToEngagementRef.operationName;
console.log(name);
```

### Variables
The `AssignUserToEngagement` mutation requires an argument of type `AssignUserToEngagementVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AssignUserToEngagementVariables {
  userId: UUIDString;
  engagementId: UUIDString;
  assignmentDate: DateString;
  roleOnEngagement: string;
  createdAt: TimestampString;
}
```
### Return Type
Recall that executing the `AssignUserToEngagement` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AssignUserToEngagementData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AssignUserToEngagementData {
  assignment_insert: Assignment_Key;
}
```
### Using `AssignUserToEngagement`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, assignUserToEngagement, AssignUserToEngagementVariables } from '@dataconnect/generated';

// The `AssignUserToEngagement` mutation requires an argument of type `AssignUserToEngagementVariables`:
const assignUserToEngagementVars: AssignUserToEngagementVariables = {
  userId: ..., 
  engagementId: ..., 
  assignmentDate: ..., 
  roleOnEngagement: ..., 
  createdAt: ..., 
};

// Call the `assignUserToEngagement()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await assignUserToEngagement(assignUserToEngagementVars);
// Variables can be defined inline as well.
const { data } = await assignUserToEngagement({ userId: ..., engagementId: ..., assignmentDate: ..., roleOnEngagement: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await assignUserToEngagement(dataConnect, assignUserToEngagementVars);

console.log(data.assignment_insert);

// Or, you can use the `Promise` API.
assignUserToEngagement(assignUserToEngagementVars).then((response) => {
  const data = response.data;
  console.log(data.assignment_insert);
});
```

### Using `AssignUserToEngagement`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, assignUserToEngagementRef, AssignUserToEngagementVariables } from '@dataconnect/generated';

// The `AssignUserToEngagement` mutation requires an argument of type `AssignUserToEngagementVariables`:
const assignUserToEngagementVars: AssignUserToEngagementVariables = {
  userId: ..., 
  engagementId: ..., 
  assignmentDate: ..., 
  roleOnEngagement: ..., 
  createdAt: ..., 
};

// Call the `assignUserToEngagementRef()` function to get a reference to the mutation.
const ref = assignUserToEngagementRef(assignUserToEngagementVars);
// Variables can be defined inline as well.
const ref = assignUserToEngagementRef({ userId: ..., engagementId: ..., assignmentDate: ..., roleOnEngagement: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = assignUserToEngagementRef(dataConnect, assignUserToEngagementVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.assignment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.assignment_insert);
});
```

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  role: string;
  photoUrl?: string | null;
  department?: string | null;
  providerIds?: string[] | null;
  createdAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  uid: ..., 
  email: ..., // optional
  displayName: ..., // optional
  role: ..., 
  photoUrl: ..., // optional
  department: ..., // optional
  providerIds: ..., // optional
  createdAt: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ uid: ..., email: ..., displayName: ..., role: ..., photoUrl: ..., department: ..., providerIds: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  uid: ..., 
  email: ..., // optional
  displayName: ..., // optional
  role: ..., 
  photoUrl: ..., // optional
  department: ..., // optional
  providerIds: ..., // optional
  createdAt: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ uid: ..., email: ..., displayName: ..., role: ..., photoUrl: ..., department: ..., providerIds: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateTechnicalResource
You can execute the `CreateTechnicalResource` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createTechnicalResource(vars: CreateTechnicalResourceVariables): MutationPromise<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;

interface CreateTechnicalResourceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTechnicalResourceVariables): MutationRef<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;
}
export const createTechnicalResourceRef: CreateTechnicalResourceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTechnicalResource(dc: DataConnect, vars: CreateTechnicalResourceVariables): MutationPromise<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;

interface CreateTechnicalResourceRef {
  ...
  (dc: DataConnect, vars: CreateTechnicalResourceVariables): MutationRef<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;
}
export const createTechnicalResourceRef: CreateTechnicalResourceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTechnicalResourceRef:
```typescript
const name = createTechnicalResourceRef.operationName;
console.log(name);
```

### Variables
The `CreateTechnicalResource` mutation requires an argument of type `CreateTechnicalResourceVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTechnicalResourceVariables {
  name: string;
  type: string;
  availabilityStatus: string;
  description?: string | null;
  costPerUnit?: number | null;
  createdAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateTechnicalResource` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTechnicalResourceData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTechnicalResourceData {
  technicalResource_insert: TechnicalResource_Key;
}
```
### Using `CreateTechnicalResource`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTechnicalResource, CreateTechnicalResourceVariables } from '@dataconnect/generated';

// The `CreateTechnicalResource` mutation requires an argument of type `CreateTechnicalResourceVariables`:
const createTechnicalResourceVars: CreateTechnicalResourceVariables = {
  name: ..., 
  type: ..., 
  availabilityStatus: ..., 
  description: ..., // optional
  costPerUnit: ..., // optional
  createdAt: ..., 
};

// Call the `createTechnicalResource()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTechnicalResource(createTechnicalResourceVars);
// Variables can be defined inline as well.
const { data } = await createTechnicalResource({ name: ..., type: ..., availabilityStatus: ..., description: ..., costPerUnit: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTechnicalResource(dataConnect, createTechnicalResourceVars);

console.log(data.technicalResource_insert);

// Or, you can use the `Promise` API.
createTechnicalResource(createTechnicalResourceVars).then((response) => {
  const data = response.data;
  console.log(data.technicalResource_insert);
});
```

### Using `CreateTechnicalResource`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTechnicalResourceRef, CreateTechnicalResourceVariables } from '@dataconnect/generated';

// The `CreateTechnicalResource` mutation requires an argument of type `CreateTechnicalResourceVariables`:
const createTechnicalResourceVars: CreateTechnicalResourceVariables = {
  name: ..., 
  type: ..., 
  availabilityStatus: ..., 
  description: ..., // optional
  costPerUnit: ..., // optional
  createdAt: ..., 
};

// Call the `createTechnicalResourceRef()` function to get a reference to the mutation.
const ref = createTechnicalResourceRef(createTechnicalResourceVars);
// Variables can be defined inline as well.
const ref = createTechnicalResourceRef({ name: ..., type: ..., availabilityStatus: ..., description: ..., costPerUnit: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTechnicalResourceRef(dataConnect, createTechnicalResourceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.technicalResource_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.technicalResource_insert);
});
```

## CreateResourceRequest
You can execute the `CreateResourceRequest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createResourceRequest(vars: CreateResourceRequestVariables): MutationPromise<CreateResourceRequestData, CreateResourceRequestVariables>;

interface CreateResourceRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateResourceRequestVariables): MutationRef<CreateResourceRequestData, CreateResourceRequestVariables>;
}
export const createResourceRequestRef: CreateResourceRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createResourceRequest(dc: DataConnect, vars: CreateResourceRequestVariables): MutationPromise<CreateResourceRequestData, CreateResourceRequestVariables>;

interface CreateResourceRequestRef {
  ...
  (dc: DataConnect, vars: CreateResourceRequestVariables): MutationRef<CreateResourceRequestData, CreateResourceRequestVariables>;
}
export const createResourceRequestRef: CreateResourceRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createResourceRequestRef:
```typescript
const name = createResourceRequestRef.operationName;
console.log(name);
```

### Variables
The `CreateResourceRequest` mutation requires an argument of type `CreateResourceRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateResourceRequestVariables {
  userId: UUIDString;
  technicalResourceId: UUIDString;
  requestDate: DateString;
  neededByDate: DateString;
  status: string;
  quantity: number;
  justification?: string | null;
  approvalDate?: DateString | null;
  createdAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateResourceRequest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateResourceRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateResourceRequestData {
  resourceRequest_insert: ResourceRequest_Key;
}
```
### Using `CreateResourceRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createResourceRequest, CreateResourceRequestVariables } from '@dataconnect/generated';

// The `CreateResourceRequest` mutation requires an argument of type `CreateResourceRequestVariables`:
const createResourceRequestVars: CreateResourceRequestVariables = {
  userId: ..., 
  technicalResourceId: ..., 
  requestDate: ..., 
  neededByDate: ..., 
  status: ..., 
  quantity: ..., 
  justification: ..., // optional
  approvalDate: ..., // optional
  createdAt: ..., 
};

// Call the `createResourceRequest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createResourceRequest(createResourceRequestVars);
// Variables can be defined inline as well.
const { data } = await createResourceRequest({ userId: ..., technicalResourceId: ..., requestDate: ..., neededByDate: ..., status: ..., quantity: ..., justification: ..., approvalDate: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createResourceRequest(dataConnect, createResourceRequestVars);

console.log(data.resourceRequest_insert);

// Or, you can use the `Promise` API.
createResourceRequest(createResourceRequestVars).then((response) => {
  const data = response.data;
  console.log(data.resourceRequest_insert);
});
```

### Using `CreateResourceRequest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createResourceRequestRef, CreateResourceRequestVariables } from '@dataconnect/generated';

// The `CreateResourceRequest` mutation requires an argument of type `CreateResourceRequestVariables`:
const createResourceRequestVars: CreateResourceRequestVariables = {
  userId: ..., 
  technicalResourceId: ..., 
  requestDate: ..., 
  neededByDate: ..., 
  status: ..., 
  quantity: ..., 
  justification: ..., // optional
  approvalDate: ..., // optional
  createdAt: ..., 
};

// Call the `createResourceRequestRef()` function to get a reference to the mutation.
const ref = createResourceRequestRef(createResourceRequestVars);
// Variables can be defined inline as well.
const ref = createResourceRequestRef({ userId: ..., technicalResourceId: ..., requestDate: ..., neededByDate: ..., status: ..., quantity: ..., justification: ..., approvalDate: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createResourceRequestRef(dataConnect, createResourceRequestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.resourceRequest_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.resourceRequest_insert);
});
```

## CreateActivityLog
You can execute the `CreateActivityLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createActivityLog(vars: CreateActivityLogVariables): MutationPromise<CreateActivityLogData, CreateActivityLogVariables>;

interface CreateActivityLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateActivityLogVariables): MutationRef<CreateActivityLogData, CreateActivityLogVariables>;
}
export const createActivityLogRef: CreateActivityLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createActivityLog(dc: DataConnect, vars: CreateActivityLogVariables): MutationPromise<CreateActivityLogData, CreateActivityLogVariables>;

interface CreateActivityLogRef {
  ...
  (dc: DataConnect, vars: CreateActivityLogVariables): MutationRef<CreateActivityLogData, CreateActivityLogVariables>;
}
export const createActivityLogRef: CreateActivityLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createActivityLogRef:
```typescript
const name = createActivityLogRef.operationName;
console.log(name);
```

### Variables
The `CreateActivityLog` mutation requires an argument of type `CreateActivityLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateActivityLogVariables {
  userId: UUIDString;
  engagementId: UUIDString;
  activityDate: DateString;
  description: string;
  hoursSpent: number;
  notes?: string | null;
  createdAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateActivityLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateActivityLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateActivityLogData {
  activityLog_insert: ActivityLog_Key;
}
```
### Using `CreateActivityLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createActivityLog, CreateActivityLogVariables } from '@dataconnect/generated';

// The `CreateActivityLog` mutation requires an argument of type `CreateActivityLogVariables`:
const createActivityLogVars: CreateActivityLogVariables = {
  userId: ..., 
  engagementId: ..., 
  activityDate: ..., 
  description: ..., 
  hoursSpent: ..., 
  notes: ..., // optional
  createdAt: ..., 
};

// Call the `createActivityLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createActivityLog(createActivityLogVars);
// Variables can be defined inline as well.
const { data } = await createActivityLog({ userId: ..., engagementId: ..., activityDate: ..., description: ..., hoursSpent: ..., notes: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createActivityLog(dataConnect, createActivityLogVars);

console.log(data.activityLog_insert);

// Or, you can use the `Promise` API.
createActivityLog(createActivityLogVars).then((response) => {
  const data = response.data;
  console.log(data.activityLog_insert);
});
```

### Using `CreateActivityLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createActivityLogRef, CreateActivityLogVariables } from '@dataconnect/generated';

// The `CreateActivityLog` mutation requires an argument of type `CreateActivityLogVariables`:
const createActivityLogVars: CreateActivityLogVariables = {
  userId: ..., 
  engagementId: ..., 
  activityDate: ..., 
  description: ..., 
  hoursSpent: ..., 
  notes: ..., // optional
  createdAt: ..., 
};

// Call the `createActivityLogRef()` function to get a reference to the mutation.
const ref = createActivityLogRef(createActivityLogVars);
// Variables can be defined inline as well.
const ref = createActivityLogRef({ userId: ..., engagementId: ..., activityDate: ..., description: ..., hoursSpent: ..., notes: ..., createdAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createActivityLogRef(dataConnect, createActivityLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.activityLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.activityLog_insert);
});
```

