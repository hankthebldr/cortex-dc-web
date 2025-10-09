const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'cortex-dc-web',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewEngagementRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewEngagement', inputVars);
}
createNewEngagementRef.operationName = 'CreateNewEngagement';
exports.createNewEngagementRef = createNewEngagementRef;

exports.createNewEngagement = function createNewEngagement(dcOrVars, vars) {
  return executeMutation(createNewEngagementRef(dcOrVars, vars));
};

const listEngagementsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEngagements');
}
listEngagementsRef.operationName = 'ListEngagements';
exports.listEngagementsRef = listEngagementsRef;

exports.listEngagements = function listEngagements(dc) {
  return executeQuery(listEngagementsRef(dc));
};

const assignUserToEngagementRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AssignUserToEngagement', inputVars);
}
assignUserToEngagementRef.operationName = 'AssignUserToEngagement';
exports.assignUserToEngagementRef = assignUserToEngagementRef;

exports.assignUserToEngagement = function assignUserToEngagement(dcOrVars, vars) {
  return executeMutation(assignUserToEngagementRef(dcOrVars, vars));
};

const listResourceRequestsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListResourceRequestsForUser', inputVars);
}
listResourceRequestsForUserRef.operationName = 'ListResourceRequestsForUser';
exports.listResourceRequestsForUserRef = listResourceRequestsForUserRef;

exports.listResourceRequestsForUser = function listResourceRequestsForUser(dcOrVars, vars) {
  return executeQuery(listResourceRequestsForUserRef(dcOrVars, vars));
};

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const createTechnicalResourceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTechnicalResource', inputVars);
}
createTechnicalResourceRef.operationName = 'CreateTechnicalResource';
exports.createTechnicalResourceRef = createTechnicalResourceRef;

exports.createTechnicalResource = function createTechnicalResource(dcOrVars, vars) {
  return executeMutation(createTechnicalResourceRef(dcOrVars, vars));
};

const createResourceRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateResourceRequest', inputVars);
}
createResourceRequestRef.operationName = 'CreateResourceRequest';
exports.createResourceRequestRef = createResourceRequestRef;

exports.createResourceRequest = function createResourceRequest(dcOrVars, vars) {
  return executeMutation(createResourceRequestRef(dcOrVars, vars));
};

const createActivityLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateActivityLog', inputVars);
}
createActivityLogRef.operationName = 'CreateActivityLog';
exports.createActivityLogRef = createActivityLogRef;

exports.createActivityLog = function createActivityLog(dcOrVars, vars) {
  return executeMutation(createActivityLogRef(dcOrVars, vars));
};
