import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'cortex-dc-web',
  location: 'us-central1'
};

export const createNewEngagementRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewEngagement', inputVars);
}
createNewEngagementRef.operationName = 'CreateNewEngagement';

export function createNewEngagement(dcOrVars, vars) {
  return executeMutation(createNewEngagementRef(dcOrVars, vars));
}

export const listEngagementsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEngagements');
}
listEngagementsRef.operationName = 'ListEngagements';

export function listEngagements(dc) {
  return executeQuery(listEngagementsRef(dc));
}

export const assignUserToEngagementRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignUserToEngagement', inputVars);
}
assignUserToEngagementRef.operationName = 'AssignUserToEngagement';

export function assignUserToEngagement(dcOrVars, vars) {
  return executeMutation(assignUserToEngagementRef(dcOrVars, vars));
}

export const listResourceRequestsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListResourceRequestsForUser', inputVars);
}
listResourceRequestsForUserRef.operationName = 'ListResourceRequestsForUser';

export function listResourceRequestsForUser(dcOrVars, vars) {
  return executeQuery(listResourceRequestsForUserRef(dcOrVars, vars));
}

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const createTechnicalResourceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTechnicalResource', inputVars);
}
createTechnicalResourceRef.operationName = 'CreateTechnicalResource';

export function createTechnicalResource(dcOrVars, vars) {
  return executeMutation(createTechnicalResourceRef(dcOrVars, vars));
}

export const createResourceRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateResourceRequest', inputVars);
}
createResourceRequestRef.operationName = 'CreateResourceRequest';

export function createResourceRequest(dcOrVars, vars) {
  return executeMutation(createResourceRequestRef(dcOrVars, vars));
}

export const createActivityLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateActivityLog', inputVars);
}
createActivityLogRef.operationName = 'CreateActivityLog';

export function createActivityLog(dcOrVars, vars) {
  return executeMutation(createActivityLogRef(dcOrVars, vars));
}

