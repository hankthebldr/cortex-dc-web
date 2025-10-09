const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'cortex-dc-web',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

exports.createNewEngagementRef = function createNewEngagementRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewEngagement', inputVars);
}
exports.createNewEngagement = function createNewEngagement(dcOrVars, vars) {
  return executeMutation(createNewEngagementRef(dcOrVars, vars));
};
exports.listEngagementsRef = function listEngagementsRef(dc) {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEngagements');
}
exports.listEngagements = function listEngagements(dc) {
  return executeQuery(listEngagementsRef(dc));
};
exports.assignUserToEngagementRef = function assignUserToEngagementRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignUserToEngagement', inputVars);
}
exports.assignUserToEngagement = function assignUserToEngagement(dcOrVars, vars) {
  return executeMutation(assignUserToEngagementRef(dcOrVars, vars));
};
exports.listResourceRequestsForUserRef = function listResourceRequestsForUserRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListResourceRequestsForUser', inputVars);
}
exports.listResourceRequestsForUser = function listResourceRequestsForUser(dcOrVars, vars) {
  return executeQuery(listResourceRequestsForUserRef(dcOrVars, vars));
};
