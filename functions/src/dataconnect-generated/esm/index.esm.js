import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'cortex-dc-web',
  location: 'us-central1'
};

export function createNewEngagementRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewEngagement', inputVars);
}

export function createNewEngagement(dcOrVars, vars) {
  return executeMutation(createNewEngagementRef(dcOrVars, vars));
}

export function listEngagementsRef(dc) {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEngagements');
}

export function listEngagements(dc) {
  return executeQuery(listEngagementsRef(dc));
}

export function assignUserToEngagementRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignUserToEngagement', inputVars);
}

export function assignUserToEngagement(dcOrVars, vars) {
  return executeMutation(assignUserToEngagementRef(dcOrVars, vars));
}

export function listResourceRequestsForUserRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListResourceRequestsForUser', inputVars);
}

export function listResourceRequestsForUser(dcOrVars, vars) {
  return executeQuery(listResourceRequestsForUserRef(dcOrVars, vars));
}

