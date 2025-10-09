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

