import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ActivityLog_Key {
  id: UUIDString;
  __typename?: 'ActivityLog_Key';
}

export interface AssignUserToEngagementData {
  assignment_insert: Assignment_Key;
}

export interface AssignUserToEngagementVariables {
  userId: UUIDString;
  engagementId: UUIDString;
  assignmentDate: DateString;
  roleOnEngagement: string;
  createdAt: TimestampString;
}

export interface Assignment_Key {
  userId: UUIDString;
  engagementId: UUIDString;
  __typename?: 'Assignment_Key';
}

export interface CreateActivityLogData {
  activityLog_insert: ActivityLog_Key;
}

export interface CreateActivityLogVariables {
  userId: UUIDString;
  engagementId: UUIDString;
  activityDate: DateString;
  description: string;
  hoursSpent: number;
  notes?: string | null;
  createdAt: TimestampString;
}

export interface CreateNewEngagementData {
  engagement_insert: Engagement_Key;
}

export interface CreateNewEngagementVariables {
  clientName?: string | null;
  description?: string | null;
  endDate: DateString;
  name: string;
  startDate: DateString;
  status: string;
  createdAt: TimestampString;
}

export interface CreateResourceRequestData {
  resourceRequest_insert: ResourceRequest_Key;
}

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

export interface CreateTechnicalResourceData {
  technicalResource_insert: TechnicalResource_Key;
}

export interface CreateTechnicalResourceVariables {
  name: string;
  type: string;
  availabilityStatus: string;
  description?: string | null;
  costPerUnit?: number | null;
  createdAt: TimestampString;
}

export interface CreateUserData {
  user_insert: User_Key;
}

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

export interface Engagement_Key {
  id: UUIDString;
  __typename?: 'Engagement_Key';
}

export interface ListEngagementsData {
  engagements: ({
    id: UUIDString;
    name: string;
    startDate: DateString;
    endDate: DateString;
    status: string;
  } & Engagement_Key)[];
}

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

export interface ListResourceRequestsForUserVariables {
  userId: UUIDString;
}

export interface ResourceRequest_Key {
  id: UUIDString;
  __typename?: 'ResourceRequest_Key';
}

export interface TechnicalResource_Key {
  id: UUIDString;
  __typename?: 'TechnicalResource_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewEngagementRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewEngagementVariables): MutationRef<CreateNewEngagementData, CreateNewEngagementVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewEngagementVariables): MutationRef<CreateNewEngagementData, CreateNewEngagementVariables>;
  operationName: string;
}
export const createNewEngagementRef: CreateNewEngagementRef;

export function createNewEngagement(vars: CreateNewEngagementVariables): MutationPromise<CreateNewEngagementData, CreateNewEngagementVariables>;
export function createNewEngagement(dc: DataConnect, vars: CreateNewEngagementVariables): MutationPromise<CreateNewEngagementData, CreateNewEngagementVariables>;

interface ListEngagementsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEngagementsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEngagementsData, undefined>;
  operationName: string;
}
export const listEngagementsRef: ListEngagementsRef;

export function listEngagements(): QueryPromise<ListEngagementsData, undefined>;
export function listEngagements(dc: DataConnect): QueryPromise<ListEngagementsData, undefined>;

interface AssignUserToEngagementRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssignUserToEngagementVariables): MutationRef<AssignUserToEngagementData, AssignUserToEngagementVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AssignUserToEngagementVariables): MutationRef<AssignUserToEngagementData, AssignUserToEngagementVariables>;
  operationName: string;
}
export const assignUserToEngagementRef: AssignUserToEngagementRef;

export function assignUserToEngagement(vars: AssignUserToEngagementVariables): MutationPromise<AssignUserToEngagementData, AssignUserToEngagementVariables>;
export function assignUserToEngagement(dc: DataConnect, vars: AssignUserToEngagementVariables): MutationPromise<AssignUserToEngagementData, AssignUserToEngagementVariables>;

interface ListResourceRequestsForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListResourceRequestsForUserVariables): QueryRef<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListResourceRequestsForUserVariables): QueryRef<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;
  operationName: string;
}
export const listResourceRequestsForUserRef: ListResourceRequestsForUserRef;

export function listResourceRequestsForUser(vars: ListResourceRequestsForUserVariables): QueryPromise<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;
export function listResourceRequestsForUser(dc: DataConnect, vars: ListResourceRequestsForUserVariables): QueryPromise<ListResourceRequestsForUserData, ListResourceRequestsForUserVariables>;

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateTechnicalResourceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTechnicalResourceVariables): MutationRef<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTechnicalResourceVariables): MutationRef<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;
  operationName: string;
}
export const createTechnicalResourceRef: CreateTechnicalResourceRef;

export function createTechnicalResource(vars: CreateTechnicalResourceVariables): MutationPromise<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;
export function createTechnicalResource(dc: DataConnect, vars: CreateTechnicalResourceVariables): MutationPromise<CreateTechnicalResourceData, CreateTechnicalResourceVariables>;

interface CreateResourceRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateResourceRequestVariables): MutationRef<CreateResourceRequestData, CreateResourceRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateResourceRequestVariables): MutationRef<CreateResourceRequestData, CreateResourceRequestVariables>;
  operationName: string;
}
export const createResourceRequestRef: CreateResourceRequestRef;

export function createResourceRequest(vars: CreateResourceRequestVariables): MutationPromise<CreateResourceRequestData, CreateResourceRequestVariables>;
export function createResourceRequest(dc: DataConnect, vars: CreateResourceRequestVariables): MutationPromise<CreateResourceRequestData, CreateResourceRequestVariables>;

interface CreateActivityLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateActivityLogVariables): MutationRef<CreateActivityLogData, CreateActivityLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateActivityLogVariables): MutationRef<CreateActivityLogData, CreateActivityLogVariables>;
  operationName: string;
}
export const createActivityLogRef: CreateActivityLogRef;

export function createActivityLog(vars: CreateActivityLogVariables): MutationPromise<CreateActivityLogData, CreateActivityLogVariables>;
export function createActivityLog(dc: DataConnect, vars: CreateActivityLogVariables): MutationPromise<CreateActivityLogData, CreateActivityLogVariables>;

