import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  initializeTestApp,
  clearFirestoreData,
  seedTestData,
  generateTestToken,
  cleanupTestFiles,
  mockCloudFunction,
  waitForFirebaseOperation
} from '../utils/test-setup';
import { ScenarioService } from '../../lib/scenario-service';
import { RemoteConfigService } from '../../lib/remote-config-service';
import { StorageService } from '../../lib/storage-service';

/**
 * Critical Path Tests: Scenario Engine
 * 
 * This test suite validates the complete scenario lifecycle management
 * including deployment, execution, monitoring, and cleanup operations.
 * Ensures no baseline disruption to existing scenario functionality.
 */

describe('Scenario Engine - Critical Path Integration', () => {
  let scenarioService: ScenarioService;
  let remoteConfigService: RemoteConfigService;
  let storageService: StorageService;
  let testApp: any;

  beforeEach(async () => {
    testApp = initializeTestApp();
    scenarioService = new ScenarioService(testApp);
    remoteConfigService = new RemoteConfigService(testApp);
    storageService = new StorageService(testApp);

    await clearFirestoreData();
    await seedTestData({
      users: [
        { id: 'user-dc-001', role: 'user', name: 'Sarah Chen', department: 'DC Team' },
        { id: 'admin-dc-001', role: 'admin', name: 'Alex Kumar', department: 'Platform Admin' }
      ],
      scenarios: [
        {
          id: 'network-segmentation-v2',
          name: 'Network Segmentation Test',
          category: 'security',
          description: 'Advanced network segmentation scenario',
          steps: [
            {
              id: 'step-1',
              type: 'network-config',
              name: 'Configure VLANs',
              config: { vlans: [100, 200], isolation: true }
            },
            {
              id: 'step-2',
              type: 'policy-apply',
              name: 'Apply Security Policies',
              config: { rules: ['deny-inter-vlan', 'allow-management'] }
            },
            {
              id: 'step-3',
              type: 'test-connectivity',
              name: 'Validate Connectivity',
              config: { endpoints: ['host-a', 'host-b'], expected: 'blocked' }
            }
          ],
          duration: 1800,
          cleanup: true,
          rollbackSupported: true
        },
        {
          id: 'identity-verification',
          name: 'Identity Verification Test',
          category: 'identity',
          description: 'Multi-factor authentication scenario',
          steps: [
            {
              id: 'step-1',
              type: 'auth-config',
              name: 'Configure MFA',
              config: { methods: ['sms', 'app'], required: true }
            },
            {
              id: 'step-2',
              type: 'test-auth',
              name: 'Test Authentication',
              config: { users: ['test-user-1', 'test-user-2'] }
            }
          ],
          duration: 1200,
          cleanup: true,
          rollbackSupported: false
        }
      ]
    });

    // Mock Remote Config defaults
    jest.spyOn(remoteConfigService, 'getAll').mockResolvedValue({
      'scenario-defaults': JSON.stringify({
        timeout: 1800,
        retryAttempts: 3,
        cleanupEnabled: true,
        logLevel: 'info'
      }),
      'feature-flags': JSON.stringify({
        parallelExecution: true,
        advancedRollback: true,
        aiRecommendations: true,
        resourceOptimization: false
      })
    });
  });

  afterEach(async () => {
    await clearFirestoreData();
    await cleanupTestFiles();
    jest.restoreAllMocks();
  });

  /**
   * Test 1: Complete Scenario Deployment Workflow
   * Validates: Cloud Functions integration, state tracking, configuration integrity
   */
  test('Complete Scenario Deployment Maintains Configuration Integrity', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Mock Cloud Function for scenario orchestration
    const mockOrchestration = mockCloudFunction('scenarioOrchestration', {
      deploymentId: 'deploy-001',
      status: 'deploying',
      estimatedDuration: 1800,
      steps: [
        { id: 'step-1', status: 'pending', estimatedDuration: 600 },
        { id: 'step-2', status: 'pending', estimatedDuration: 600 },
        { id: 'step-3', status: 'pending', estimatedDuration: 600 }
      ]
    });

    // Start scenario deployment
    const deploymentRequest = {
      scenarioId: 'network-segmentation-v2',
      povId: 'pov-001',
      environment: 'test',
      parameters: {
        customerNetwork: '192.168.1.0/24',
        managementVlan: 100,
        customerVlan: 200
      }
    };

    const deployment = await scenarioService.deployScenario(
      deploymentRequest,
      { auth: userToken }
    );

    // Validate deployment initiation
    expect(deployment.id).toBe('deploy-001');
    expect(deployment.status).toBe('deploying');
    expect(deployment.scenarioId).toBe('network-segmentation-v2');
    expect(deployment.povId).toBe('pov-001');
    expect(deployment.createdBy).toBe('user-dc-001');

    // Verify Cloud Function was called correctly
    expect(mockOrchestration).toHaveBeenCalledWith({
      action: 'deploy',
      scenario: expect.objectContaining({
        id: 'network-segmentation-v2',
        steps: expect.arrayContaining([
          expect.objectContaining({ id: 'step-1', type: 'network-config' })
        ])
      }),
      parameters: deploymentRequest.parameters,
      povId: 'pov-001'
    });

    // Verify deployment state is tracked in Firestore
    const deploymentDoc = await testApp.firestore()
      .collection('scenario-executions')
      .doc('deploy-001')
      .get();

    expect(deploymentDoc.exists).toBe(true);
    const deploymentData = deploymentDoc.data();
    expect(deploymentData.status).toBe('deploying');
    expect(deploymentData.steps).toHaveLength(3);
    expect(deploymentData.configuration).toEqual(deploymentRequest.parameters);

    // Verify scenario execution count is incremented
    const scenarioDoc = await testApp.firestore()
      .collection('scenarios')
      .doc('network-segmentation-v2')
      .get();

    const scenarioData = scenarioDoc.data();
    expect(scenarioData.executionCount).toBe(1);
    expect(scenarioData.lastExecuted).toBeInstanceOf(Date);
  });

  /**
   * Test 2: Scenario Step Execution and Error Handling
   * Validates: Step-by-step execution, failure recovery, rollback procedures
   */
  test('Scenario Execution Handles Step Failures with Proper Rollback', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Create a deployment first
    await testApp.firestore()
      .collection('scenario-executions')
      .doc('deploy-002')
      .set({
        id: 'deploy-002',
        scenarioId: 'network-segmentation-v2',
        povId: 'pov-001',
        status: 'deploying',
        currentStep: 0,
        steps: [
          { id: 'step-1', status: 'completed', result: { success: true, duration: 300 } },
          { id: 'step-2', status: 'running', result: null },
          { id: 'step-3', status: 'pending', result: null }
        ],
        createdBy: 'user-dc-001',
        createdAt: new Date(),
        configuration: { vlans: [100, 200] }
      });

    // Mock step execution failure
    const mockExecutor = mockCloudFunction('scenarioExecutor', {
      status: 'failed',
      error: 'Invalid policy rule: deny-inter-vlan-invalid',
      stepId: 'step-2',
      rollbackInitiated: true,
      rollbackSteps: ['step-1-rollback']
    });

    // Execute failing step
    const executionResult = await scenarioService.executeStep(
      'deploy-002',
      'step-2',
      { auth: userToken }
    );

    expect(executionResult.status).toBe('failed');
    expect(executionResult.error).toContain('Invalid policy rule');
    expect(executionResult.rollbackInitiated).toBe(true);

    // Verify scenario state reflects failure
    const scenarioState = await scenarioService.getScenarioState('deploy-002');
    expect(scenarioState.status).toBe('failed');
    expect(scenarioState.failedStep).toBe('step-2');
    expect(scenarioState.rollbackStatus).toBe('in-progress');

    // Verify rollback steps are created
    expect(scenarioState.rollbackSteps).toHaveLength(1);
    expect(scenarioState.rollbackSteps[0]).toBe('step-1-rollback');

    // Mock successful rollback execution
    const mockRollback = mockCloudFunction('scenarioExecutor', {
      status: 'completed',
      stepId: 'step-1-rollback',
      result: { success: true, rollbackComplete: true }
    });

    // Execute rollback
    const rollbackResult = await scenarioService.executeRollback(
      'deploy-002',
      { auth: userToken }
    );

    expect(rollbackResult.status).toBe('completed');
    expect(rollbackResult.rollbackComplete).toBe(true);

    // Verify final state
    const finalState = await scenarioService.getScenarioState('deploy-002');
    expect(finalState.status).toBe('rolled-back');
    expect(finalState.rollbackStatus).toBe('completed');
  });

  /**
   * Test 3: Remote Config Integration and Feature Flags
   * Validates: Dynamic configuration, feature flag control, default application
   */
  test('Remote Config Controls Scenario Behavior Dynamically', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Test scenario configuration processing with defaults
    const baseScenarioConfig = {
      id: 'custom-scenario',
      name: 'Custom Test Scenario',
      steps: [
        { id: 'step-1', type: 'test', config: {} }
      ]
      // No timeout or retry settings specified
    };

    const processedConfig = await scenarioService.processScenarioConfig(
      baseScenarioConfig
    );

    // Verify defaults are applied from Remote Config
    expect(processedConfig.timeout).toBe(1800);
    expect(processedConfig.retryAttempts).toBe(3);
    expect(processedConfig.cleanupEnabled).toBe(true);
    expect(processedConfig.logLevel).toBe('info');

    // Verify feature flags are applied
    expect(processedConfig.features.parallelExecution).toBe(true);
    expect(processedConfig.features.advancedRollback).toBe(true);
    expect(processedConfig.features.aiRecommendations).toBe(true);
    expect(processedConfig.features.resourceOptimization).toBe(false);

    // Test feature flag behavior changes
    jest.spyOn(remoteConfigService, 'getAll').mockResolvedValue({
      'feature-flags': JSON.stringify({
        parallelExecution: false,
        advancedRollback: true,
        resourceOptimization: true
      })
    });

    const scenario = await scenarioService.createScenarioExecution(
      'network-segmentation-v2',
      { auth: userToken }
    );

    expect(scenario.executionMode).toBe('sequential'); // Due to parallelExecution: false
    expect(scenario.rollbackStrategy).toBe('advanced'); // Due to advancedRollback: true
    expect(scenario.resourceOptimization).toBe(true); // Due to resourceOptimization: true
  });

  /**
   * Test 4: Scenario Resource Management and Cleanup
   * Validates: Storage integration, resource tracking, cleanup procedures
   */
  test('Scenario Resource Management Ensures Proper Cleanup', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Create scenario execution with resources
    const deployment = await scenarioService.deployScenario({
      scenarioId: 'network-segmentation-v2',
      povId: 'pov-001',
      environment: 'test',
      resources: {
        networks: ['test-network-1', 'test-network-2'],
        instances: ['test-vm-1', 'test-vm-2'],
        configs: ['firewall-rules.json', 'vlan-config.yaml']
      }
    }, { auth: userToken });

    // Mock resource creation in storage
    const mockStorage = jest.spyOn(storageService, 'uploadFile');
    mockStorage.mockResolvedValue({
      url: 'gs://cortex-dc-test/scenario-resources/deploy-001/firewall-rules.json',
      metadata: { deploymentId: deployment.id, resourceType: 'config' }
    });

    // Upload scenario configuration files
    const configFile = new File(['{"rules": ["deny-all"]}'], 'firewall-rules.json', {
      type: 'application/json'
    });

    const uploadResult = await scenarioService.uploadScenarioResource(
      deployment.id,
      configFile,
      { resourceType: 'config', category: 'firewall' },
      { auth: userToken }
    );

    expect(uploadResult.url).toContain('firewall-rules.json');
    expect(uploadResult.metadata.deploymentId).toBe(deployment.id);

    // Verify resources are tracked
    const deploymentState = await scenarioService.getScenarioState(deployment.id);
    expect(deploymentState.resources.configs).toContain(uploadResult.url);

    // Mock successful scenario completion
    mockCloudFunction('scenarioOrchestration', {
      status: 'completed',
      deploymentId: deployment.id,
      cleanupRequired: true,
      resources: deploymentState.resources
    });

    // Complete scenario execution
    await scenarioService.completeScenario(
      deployment.id,
      { 
        results: { success: true, duration: 1200 },
        metrics: { networksCreated: 2, instancesLaunched: 2 }
      },
      { auth: userToken }
    );

    // Mock cleanup function
    const mockCleanup = mockCloudFunction('scenarioCleanup', {
      status: 'completed',
      cleanedResources: ['test-network-1', 'test-network-2', 'test-vm-1', 'test-vm-2'],
      storageFilesDeleted: 3
    });

    // Execute cleanup
    const cleanupResult = await scenarioService.executeCleanup(
      deployment.id,
      { auth: userToken }
    );

    expect(cleanupResult.status).toBe('completed');
    expect(cleanupResult.cleanedResources).toHaveLength(4);
    expect(cleanupResult.storageFilesDeleted).toBe(3);

    // Verify final deployment state
    const finalState = await scenarioService.getScenarioState(deployment.id);
    expect(finalState.status).toBe('completed');
    expect(finalState.cleanupStatus).toBe('completed');
    expect(finalState.resources.cleaned).toBe(true);
  });

  /**
   * Test 5: Scenario Analytics and Performance Monitoring
   * Validates: Metrics collection, performance tracking, analytics aggregation
   */
  test('Scenario Analytics Track Performance and Usage Patterns', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Execute multiple scenarios to generate analytics data
    const executions = await Promise.all([
      scenarioService.recordScenarioExecution({
        scenarioId: 'network-segmentation-v2',
        povId: 'pov-001',
        consultant: 'user-dc-001',
        duration: 1200,
        success: true,
        metrics: {
          networksCreated: 2,
          policiesApplied: 5,
          testsRun: 3,
          resourceUtilization: 0.65
        }
      }),
      
      scenarioService.recordScenarioExecution({
        scenarioId: 'identity-verification',
        povId: 'pov-002',
        consultant: 'user-dc-001',
        duration: 900,
        success: true,
        metrics: {
          usersAuthenticated: 10,
          mfaMethodsTested: 2,
          authenticationAttempts: 15,
          successRate: 0.87
        }
      }),
      
      scenarioService.recordScenarioExecution({
        scenarioId: 'network-segmentation-v2',
        povId: 'pov-003',
        consultant: 'user-dc-001',
        duration: 1450,
        success: false,
        errorType: 'configuration-error',
        metrics: {
          networksCreated: 1,
          policiesApplied: 2,
          testsRun: 1,
          failurePoint: 'step-2'
        }
      })
    ]);

    // Generate scenario analytics
    const scenarioAnalytics = await scenarioService.getScenarioAnalytics('network-segmentation-v2');
    
    expect(scenarioAnalytics.totalExecutions).toBe(2);
    expect(scenarioAnalytics.successfulExecutions).toBe(1);
    expect(scenarioAnalytics.failedExecutions).toBe(1);
    expect(scenarioAnalytics.successRate).toBe(0.5);
    expect(scenarioAnalytics.averageDuration).toBe(1325); // (1200 + 1450) / 2
    
    // Verify performance metrics
    expect(scenarioAnalytics.performanceMetrics.averageResourceUtilization).toBe(0.65);
    expect(scenarioAnalytics.performanceMetrics.commonFailurePoints).toContain('step-2');

    // Generate consultant analytics
    const consultantAnalytics = await scenarioService.getConsultantScenarioAnalytics('user-dc-001');
    
    expect(consultantAnalytics.totalScenarios).toBe(2); // Unique scenarios
    expect(consultantAnalytics.totalExecutions).toBe(3);
    expect(consultantAnalytics.overallSuccessRate).toBeCloseTo(0.67, 2); // 2/3
    expect(consultantAnalytics.averageExecutionTime).toBeCloseTo(1183, 0); // (1200 + 900 + 1450) / 3

    // Test scenario popularity metrics
    const popularityMetrics = await scenarioService.getScenarioPopularityMetrics();
    expect(popularityMetrics['network-segmentation-v2'].executionCount).toBe(2);
    expect(popularityMetrics['identity-verification'].executionCount).toBe(1);
    expect(popularityMetrics['network-segmentation-v2'].averageRating).toBeGreaterThan(0);

    // Verify analytics are stored for DataConnect queries
    const analyticsDoc = await testApp.firestore()
      .collection('scenario-analytics')
      .doc('network-segmentation-v2')
      .get();

    expect(analyticsDoc.exists).toBe(true);
    const analyticsData = analyticsDoc.data();
    expect(analyticsData.totalExecutions).toBe(2);
    expect(analyticsData.lastUpdated).toBeInstanceOf(Date);
  });

  /**
   * Test 6: Scenario Version Management and Migration
   * Validates: Version control, backward compatibility, migration procedures
   */
  test('Scenario Version Management Maintains Backward Compatibility', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    const adminToken = await generateTestToken('admin', 'admin-dc-001');
    
    // Create new version of existing scenario
    const newScenarioVersion = {
      id: 'network-segmentation-v3',
      name: 'Network Segmentation Test v3',
      category: 'security',
      description: 'Enhanced network segmentation with micro-segmentation',
      version: '3.0.0',
      basedOn: 'network-segmentation-v2',
      steps: [
        {
          id: 'step-1',
          type: 'network-config',
          name: 'Configure Micro-segments',
          config: { 
            microSegments: true,
            vlans: [100, 200, 300], 
            isolation: 'strict' 
          }
        },
        {
          id: 'step-2',
          type: 'policy-apply',
          name: 'Apply Micro-segmentation Policies',
          config: { 
            rules: ['deny-all-default', 'allow-explicit-only'],
            enforcement: 'strict'
          }
        },
        {
          id: 'step-3',
          type: 'test-connectivity',
          name: 'Validate Micro-segmentation',
          config: { 
            endpoints: ['host-a', 'host-b', 'host-c'], 
            expected: 'isolated',
            compliance: ['pci-dss', 'sox']
          }
        },
        {
          id: 'step-4',
          type: 'compliance-check',
          name: 'Verify Compliance',
          config: {
            standards: ['pci-dss', 'sox'],
            auditTrail: true
          }
        }
      ],
      duration: 2400,
      cleanup: true,
      rollbackSupported: true,
      compatibilityLevel: 'v2-compatible'
    };

    // Create new scenario version (admin only)
    const createdScenario = await scenarioService.createScenarioVersion(
      newScenarioVersion,
      { auth: adminToken }
    );

    expect(createdScenario.id).toBe('network-segmentation-v3');
    expect(createdScenario.version).toBe('3.0.0');
    expect(createdScenario.basedOn).toBe('network-segmentation-v2');
    expect(createdScenario.compatibilityLevel).toBe('v2-compatible');

    // Test that existing deployments can still use v2
    const v2Deployment = await scenarioService.deployScenario({
      scenarioId: 'network-segmentation-v2',
      povId: 'pov-legacy',
      environment: 'test'
    }, { auth: userToken });

    expect(v2Deployment.scenarioId).toBe('network-segmentation-v2');
    expect(v2Deployment.status).toBe('deploying');

    // Test migration from v2 to v3
    const migrationPlan = await scenarioService.createMigrationPlan(
      'network-segmentation-v2',
      'network-segmentation-v3'
    );

    expect(migrationPlan.compatibilityIssues).toHaveLength(0); // Should be compatible
    expect(migrationPlan.newFeatures).toContain('micro-segmentation');
    expect(migrationPlan.newFeatures).toContain('compliance-check');
    expect(migrationPlan.configurationChanges.vlans).toEqual({
      from: [100, 200],
      to: [100, 200, 300]
    });

    // Execute migration for existing POV
    const migrationResult = await scenarioService.migratePOVScenario(
      'pov-001',
      'network-segmentation-v2',
      'network-segmentation-v3',
      {
        preserveConfiguration: true,
        validateCompatibility: true
      },
      { auth: userToken }
    );

    expect(migrationResult.success).toBe(true);
    expect(migrationResult.configurationPreserved).toBe(true);
    expect(migrationResult.newFeatures).toContain('compliance-check');

    // Verify POV now references new scenario version
    const updatedPOV = await testApp.firestore()
      .collection('povs')
      .doc('pov-001')
      .get();

    const povData = updatedPOV.data();
    expect(povData.scenarios).toContain('network-segmentation-v3');
    expect(povData.scenarios).not.toContain('network-segmentation-v2');

    // Verify migration is tracked in audit trail
    expect(povData.auditTrail).toEqual(expect.arrayContaining([
      expect.objectContaining({
        action: 'scenario-migrated',
        details: expect.objectContaining({
          from: 'network-segmentation-v2',
          to: 'network-segmentation-v3'
        })
      })
    ]));
  });

  /**
   * Test 7: Scenario Security and Access Control
   * Validates: RBAC enforcement, secure execution, audit logging
   */
  test('Scenario Security Enforces Proper Access Controls', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    const adminToken = await generateTestToken('admin', 'admin-dc-001');
    
    // Test that users cannot create new scenarios
    const unauthorizedScenario = {
      id: 'unauthorized-scenario',
      name: 'Unauthorized Test',
      category: 'security',
      steps: [{ id: 'step-1', type: 'test', config: {} }]
    };

    await expect(
      scenarioService.createScenario(unauthorizedScenario, { auth: userToken })
    ).rejects.toThrow('Admin access required to create scenarios');

    // Test that admin can create scenarios
    const authorizedScenario = await scenarioService.createScenario(
      unauthorizedScenario,
      { auth: adminToken }
    );

    expect(authorizedScenario.id).toBe('unauthorized-scenario');
    expect(authorizedScenario.createdBy).toBe('admin-dc-001');

    // Test execution permissions
    const deployment = await scenarioService.deployScenario({
      scenarioId: 'network-segmentation-v2',
      povId: 'pov-001',
      environment: 'test'
    }, { auth: userToken });

    // User can execute scenarios they deployed
    const executionResult = await scenarioService.executeStep(
      deployment.id,
      'step-1',
      { auth: userToken }
    );

    expect(executionResult).toBeDefined();

    // User cannot execute scenarios deployed by others
    await testApp.firestore()
      .collection('scenario-executions')
      .doc('other-deployment')
      .set({
        id: 'other-deployment',
        scenarioId: 'network-segmentation-v2',
        createdBy: 'other-user-001',
        status: 'deploying'
      });

    await expect(
      scenarioService.executeStep(
        'other-deployment',
        'step-1',
        { auth: userToken }
      )
    ).rejects.toThrow('Access denied: not authorized to execute this scenario');

    // Admin can execute any scenario
    const adminExecution = await scenarioService.executeStep(
      'other-deployment',
      'step-1',
      { auth: adminToken }
    );

    expect(adminExecution).toBeDefined();

    // Verify all operations are logged
    const auditLogs = await testApp.firestore()
      .collection('audit-logs')
      .where('entityType', '==', 'scenario')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    expect(auditLogs.size).toBeGreaterThan(0);
    
    const logEntries = auditLogs.docs.map(doc => doc.data());
    expect(logEntries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        action: 'scenario-created',
        user: 'admin-dc-001',
        entityId: 'unauthorized-scenario'
      }),
      expect.objectContaining({
        action: 'scenario-deployed',
        user: 'user-dc-001',
        entityId: deployment.id
      }),
      expect.objectContaining({
        action: 'step-executed',
        user: 'admin-dc-001',
        entityId: 'other-deployment'
      })
    ]));
  });
});