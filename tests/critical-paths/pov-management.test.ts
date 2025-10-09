import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  initializeTestApp, 
  clearFirestoreData, 
  seedTestData,
  generateTestToken,
  cleanupTestFiles
} from '../utils/test-setup';
import { POVService } from '../../lib/pov-service';
import { ScenarioService } from '../../lib/scenario-service';
import { StorageService } from '../../lib/storage-service';

/**
 * Critical Path Tests: POV Management
 * 
 * This test suite validates the complete POV management lifecycle
 * and ensures no baseline disruption to existing functionality.
 */

describe('POV Management - Critical Path Integration', () => {
  let povService: POVService;
  let scenarioService: ScenarioService;
  let storageService: StorageService;
  let testApp: any;

  beforeEach(async () => {
    testApp = initializeTestApp();
    povService = new POVService(testApp);
    scenarioService = new ScenarioService(testApp);
    storageService = new StorageService(testApp);
    
    await clearFirestoreData();
    await seedTestData({
      users: [
        { id: 'user-dc-001', role: 'user', name: 'Sarah Chen', department: 'DC Team' },
        { id: 'mgmt-dc-001', role: 'management', name: 'Marcus Rodriguez', department: 'DC Management' }
      ],
      scenarios: [
        { id: 'network-segmentation', name: 'Network Segmentation', category: 'security' },
        { id: 'identity-verification', name: 'Identity Verification', category: 'identity' },
        { id: 'endpoint-protection', name: 'Endpoint Protection', category: 'security' }
      ]
    });
  });

  afterEach(async () => {
    await clearFirestoreData();
    await cleanupTestFiles();
  });

  /**
   * Test 1: Complete POV Creation Workflow
   * Validates: Firestore integration, scenario linking, metadata preservation
   */
  test('Complete POV Creation Workflow Maintains Data Integrity', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Step 1: Create POV with required fields
    const povData = {
      title: 'Zero Trust Implementation - Acme Corp',
      customer: 'Acme Corporation',
      description: 'Comprehensive Zero Trust architecture implementation',
      objectives: [
        'Implement network segmentation',
        'Deploy identity verification',
        'Enable endpoint protection'
      ],
      timeline: {
        start: new Date('2024-02-01'),
        end: new Date('2024-04-01'),
        milestones: [
          { name: 'Planning Complete', date: new Date('2024-02-15') },
          { name: 'Phase 1 Deployment', date: new Date('2024-03-01') },
          { name: 'Validation & Handoff', date: new Date('2024-03-30') }
        ]
      },
      scenarios: ['network-segmentation', 'identity-verification'],
      stakeholders: [
        { name: 'John Smith', role: 'CISO', email: 'john.smith@acme.com' },
        { name: 'Jane Doe', role: 'IT Director', email: 'jane.doe@acme.com' }
      ],
      businessValue: {
        riskReduction: 85,
        efficiencyGain: 30,
        complianceImprovement: 90
      }
    };

    const createdPOV = await povService.createPOV(povData, { auth: userToken });

    // Validate POV creation
    expect(createdPOV.id).toBeDefined();
    expect(createdPOV.title).toBe(povData.title);
    expect(createdPOV.status).toBe('draft');
    expect(createdPOV.consultant).toBe('user-dc-001');
    expect(createdPOV.createdAt).toBeInstanceOf(Date);
    expect(createdPOV.scenarios).toEqual(povData.scenarios);

    // Step 2: Verify Firestore document structure
    const firestoreDoc = await testApp.firestore()
      .collection('povs')
      .doc(createdPOV.id)
      .get();

    expect(firestoreDoc.exists).toBe(true);
    const firestoreData = firestoreDoc.data();
    expect(firestoreData.timeline.milestones).toHaveLength(3);
    expect(firestoreData.businessValue.riskReduction).toBe(85);
    expect(firestoreData.stakeholders).toHaveLength(2);

    // Step 3: Verify scenario relationships are created
    for (const scenarioId of povData.scenarios) {
      const scenario = await scenarioService.getScenario(scenarioId);
      expect(scenario.povReferences).toContain(createdPOV.id);
    }

    // Step 4: Verify audit trail
    expect(createdPOV.auditTrail).toHaveLength(1);
    expect(createdPOV.auditTrail[0].action).toBe('created');
    expect(createdPOV.auditTrail[0].user).toBe('user-dc-001');
  });

  /**
   * Test 2: POV Update Preserves Critical Data
   * Validates: Data integrity during updates, relationship preservation
   */
  test('POV Updates Preserve Critical Data and Relationships', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Create initial POV
    const initialPOV = await povService.createPOV({
      title: 'Initial POV',
      customer: 'Test Customer',
      scenarios: ['network-segmentation'],
      timeline: {
        start: new Date('2024-02-01'),
        end: new Date('2024-04-01')
      },
      businessValue: {
        riskReduction: 75,
        efficiencyGain: 20,
        complianceImprovement: 80
      }
    }, { auth: userToken });

    const originalCreatedAt = initialPOV.createdAt;
    const originalConsultant = initialPOV.consultant;
    const originalTimeline = initialPOV.timeline;

    // Update POV
    const updates = {
      status: 'in-progress',
      scenarios: ['network-segmentation', 'identity-verification'], // Add scenario
      description: 'Updated description with more details',
      businessValue: {
        ...initialPOV.businessValue,
        riskReduction: 85 // Update business value
      }
    };

    const updatedPOV = await povService.updatePOV(initialPOV.id, updates, { auth: userToken });

    // Validate critical data preservation
    expect(updatedPOV.id).toBe(initialPOV.id);
    expect(updatedPOV.createdAt).toEqual(originalCreatedAt);
    expect(updatedPOV.consultant).toBe(originalConsultant);
    expect(updatedPOV.timeline).toEqual(originalTimeline);

    // Validate updates were applied
    expect(updatedPOV.status).toBe('in-progress');
    expect(updatedPOV.scenarios).toContain('identity-verification');
    expect(updatedPOV.description).toBe('Updated description with more details');
    expect(updatedPOV.businessValue.riskReduction).toBe(85);

    // Validate audit trail
    expect(updatedPOV.auditTrail).toHaveLength(2);
    expect(updatedPOV.auditTrail[1].action).toBe('updated');
    expect(updatedPOV.auditTrail[1].changes).toEqual(expect.arrayContaining([
      'status', 'scenarios', 'description', 'businessValue'
    ]));

    // Validate new scenario relationship
    const identityScenario = await scenarioService.getScenario('identity-verification');
    expect(identityScenario.povReferences).toContain(initialPOV.id);
  });

  /**
   * Test 3: File Attachment Management
   * Validates: Storage integration, metadata preservation, cleanup
   */
  test('POV File Attachments Maintain Integrity and Security', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Create POV
    const pov = await povService.createPOV({
      title: 'POV with Attachments',
      customer: 'Test Customer',
      scenarios: ['network-segmentation']
    }, { auth: userToken });

    // Create test files
    const requirementsFile = new File(
      ['# Requirements Document\n\n## Network Requirements\n- VLAN segmentation\n- Firewall policies'], 
      'requirements.md', 
      { type: 'text/markdown' }
    );

    const architectureDiagram = new File(
      [new ArrayBuffer(1024)], // Mock binary data
      'network-architecture.pdf',
      { type: 'application/pdf' }
    );

    // Upload attachments
    const attachment1 = await povService.uploadAttachment(
      pov.id, 
      requirementsFile, 
      { 
        category: 'requirements',
        description: 'Network requirements document' 
      },
      { auth: userToken }
    );

    const attachment2 = await povService.uploadAttachment(
      pov.id,
      architectureDiagram,
      {
        category: 'diagrams',
        description: 'Network architecture diagram'
      },
      { auth: userToken }
    );

    // Validate upload results
    expect(attachment1.id).toBeDefined();
    expect(attachment1.originalName).toBe('requirements.md');
    expect(attachment1.contentType).toBe('text/markdown');
    expect(attachment1.category).toBe('requirements');
    expect(attachment1.uploadedBy).toBe('user-dc-001');

    // Validate storage path structure
    expect(attachment1.storagePath).toMatch(
      new RegExp(`^povs/${pov.id}/attachments/[a-zA-Z0-9-]+\\.md$`)
    );

    // Verify POV is updated with attachment references
    const updatedPOV = await povService.getPOV(pov.id, { auth: userToken });
    expect(updatedPOV.attachments).toHaveLength(2);
    expect(updatedPOV.attachments).toContain(attachment1.id);
    expect(updatedPOV.attachments).toContain(attachment2.id);

    // Test attachment download
    const downloadUrl = await povService.getAttachmentDownloadUrl(
      pov.id, 
      attachment1.id, 
      { auth: userToken }
    );
    expect(downloadUrl).toMatch(/^https:\/\/.*\.googleapis\.com\/.*$/);

    // Test attachment metadata retrieval
    const attachmentMeta = await povService.getAttachmentMetadata(
      pov.id,
      attachment1.id,
      { auth: userToken }
    );
    expect(attachmentMeta.originalName).toBe('requirements.md');
    expect(attachmentMeta.size).toBeGreaterThan(0);
    expect(attachmentMeta.category).toBe('requirements');

    // Test attachment deletion
    await povService.deleteAttachment(pov.id, attachment1.id, { auth: userToken });

    // Verify attachment is removed from POV
    const povAfterDeletion = await povService.getPOV(pov.id, { auth: userToken });
    expect(povAfterDeletion.attachments).toHaveLength(1);
    expect(povAfterDeletion.attachments).not.toContain(attachment1.id);

    // Verify storage file is removed
    await expect(
      povService.getAttachmentDownloadUrl(pov.id, attachment1.id, { auth: userToken })
    ).rejects.toThrow('Attachment not found');
  });

  /**
   * Test 4: POV Status Transitions and Workflow
   * Validates: State machine logic, validation rules, notifications
   */
  test('POV Status Transitions Follow Business Rules', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    const mgmtToken = await generateTestToken('management', 'mgmt-dc-001');
    
    // Create POV in draft status
    const pov = await povService.createPOV({
      title: 'Workflow Test POV',
      customer: 'Test Customer',
      scenarios: ['network-segmentation'],
      objectives: ['Test objective'],
      timeline: {
        start: new Date('2024-02-01'),
        end: new Date('2024-04-01')
      }
    }, { auth: userToken });

    expect(pov.status).toBe('draft');

    // Transition: Draft -> Under Review
    const reviewPOV = await povService.updatePOVStatus(
      pov.id, 
      'under-review',
      { 
        comment: 'Ready for management review',
        attachRequiredFields: true 
      },
      { auth: userToken }
    );

    expect(reviewPOV.status).toBe('under-review');
    expect(reviewPOV.statusHistory).toHaveLength(2);
    expect(reviewPOV.statusHistory[1].from).toBe('draft');
    expect(reviewPOV.statusHistory[1].to).toBe('under-review');

    // Test invalid transition (user cannot approve)
    await expect(
      povService.updatePOVStatus(
        pov.id,
        'approved',
        { comment: 'Self-approval attempt' },
        { auth: userToken }
      )
    ).rejects.toThrow('User does not have permission to approve POVs');

    // Valid transition: Under Review -> Approved (by management)
    const approvedPOV = await povService.updatePOVStatus(
      pov.id,
      'approved',
      { 
        comment: 'POV approved for execution',
        approvedBy: 'mgmt-dc-001' 
      },
      { auth: mgmtToken }
    );

    expect(approvedPOV.status).toBe('approved');
    expect(approvedPOV.approvals).toHaveLength(1);
    expect(approvedPOV.approvals[0].approver).toBe('mgmt-dc-001');

    // Transition: Approved -> In Progress
    const inProgressPOV = await povService.updatePOVStatus(
      pov.id,
      'in-progress',
      { comment: 'Starting POV execution' },
      { auth: userToken }
    );

    expect(inProgressPOV.status).toBe('in-progress');
    expect(inProgressPOV.executionStartDate).toBeInstanceOf(Date);

    // Test scenario execution tracking
    await povService.recordScenarioExecution(
      pov.id,
      'network-segmentation',
      {
        status: 'completed',
        results: { success: true, duration: 120 },
        executedAt: new Date()
      },
      { auth: userToken }
    );

    const povWithResults = await povService.getPOV(pov.id, { auth: userToken });
    expect(povWithResults.scenarioResults['network-segmentation'].status).toBe('completed');
    expect(povWithResults.progress.completedScenarios).toBe(1);
    expect(povWithResults.progress.totalScenarios).toBe(1);
    expect(povWithResults.progress.percentage).toBe(100);

    // Transition: In Progress -> Completed
    const completedPOV = await povService.updatePOVStatus(
      pov.id,
      'completed',
      { 
        comment: 'All scenarios executed successfully',
        completionSummary: {
          objectivesMet: 1,
          totalObjectives: 1,
          businessValueAchieved: 85,
          customerSatisfaction: 4.5
        }
      },
      { auth: userToken }
    );

    expect(completedPOV.status).toBe('completed');
    expect(completedPOV.completedAt).toBeInstanceOf(Date);
    expect(completedPOV.completionSummary.businessValueAchieved).toBe(85);
  });

  /**
   * Test 5: POV Analytics and Reporting
   * Validates: DataConnect integration, metric calculation, export functionality
   */
  test('POV Analytics Generate Accurate Metrics', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    
    // Create multiple POVs with different statuses
    const povs = await Promise.all([
      povService.createPOV({
        title: 'POV 1 - Completed',
        customer: 'Customer A',
        scenarios: ['network-segmentation'],
        status: 'completed'
      }, { auth: userToken }),
      
      povService.createPOV({
        title: 'POV 2 - In Progress',
        customer: 'Customer B',
        scenarios: ['identity-verification', 'endpoint-protection'],
        status: 'in-progress'
      }, { auth: userToken }),
      
      povService.createPOV({
        title: 'POV 3 - Draft',
        customer: 'Customer C',
        scenarios: ['network-segmentation'],
        status: 'draft'
      }, { auth: userToken })
    ]);

    // Record scenario executions for analytics
    await povService.recordScenarioExecution(
      povs[0].id,
      'network-segmentation',
      {
        status: 'completed',
        results: { success: true, duration: 180 },
        executedAt: new Date()
      },
      { auth: userToken }
    );

    await povService.recordScenarioExecution(
      povs[1].id,
      'identity-verification',
      {
        status: 'completed',
        results: { success: true, duration: 240 },
        executedAt: new Date()
      },
      { auth: userToken }
    );

    // Generate consultant analytics
    const analytics = await povService.getConsultantAnalytics('user-dc-001');

    expect(analytics.totalPOVs).toBe(3);
    expect(analytics.completedPOVs).toBe(1);
    expect(analytics.inProgressPOVs).toBe(1);
    expect(analytics.draftPOVs).toBe(1);
    expect(analytics.totalScenariosExecuted).toBe(2);
    expect(analytics.averageScenarioDuration).toBe(210); // (180 + 240) / 2
    expect(analytics.successRate).toBe(1.0); // All scenarios successful

    // Test scenario popularity metrics
    const scenarioMetrics = await povService.getScenarioMetrics();
    expect(scenarioMetrics['network-segmentation'].usageCount).toBe(2);
    expect(scenarioMetrics['identity-verification'].usageCount).toBe(1);
    expect(scenarioMetrics['endpoint-protection'].usageCount).toBe(1);

    // Test customer engagement metrics
    const customerMetrics = await povService.getCustomerMetrics();
    expect(Object.keys(customerMetrics)).toHaveLength(3);
    expect(customerMetrics['Customer A'].povCount).toBe(1);
    expect(customerMetrics['Customer A'].status).toBe('completed');
  });

  /**
   * Test 6: POV Archival and Data Retention
   * Validates: Soft deletion, data preservation, compliance requirements
   */
  test('POV Archival Preserves Data for Compliance', async () => {
    const userToken = await generateTestToken('user', 'user-dc-001');
    const mgmtToken = await generateTestToken('management', 'mgmt-dc-001');
    
    // Create and complete a POV
    const pov = await povService.createPOV({
      title: 'POV for Archival',
      customer: 'Archive Test Customer',
      scenarios: ['network-segmentation'],
      businessValue: {
        riskReduction: 80,
        efficiencyGain: 25,
        complianceImprovement: 90
      }
    }, { auth: userToken });

    // Add attachments
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const attachment = await povService.uploadAttachment(
      pov.id,
      testFile,
      { category: 'test' },
      { auth: userToken }
    );

    // Complete the POV
    await povService.updatePOVStatus(pov.id, 'completed', 
      { comment: 'POV completed successfully' }, 
      { auth: userToken }
    );

    // Archive the POV (management permission required)
    const archivedPOV = await povService.archivePOV(
      pov.id,
      {
        reason: 'Project completed, moving to archive for compliance',
        retentionPeriod: 7 * 365 // 7 years
      },
      { auth: mgmtToken }
    );

    expect(archivedPOV.status).toBe('archived');
    expect(archivedPOV.archivedAt).toBeInstanceOf(Date);
    expect(archivedPOV.archiveMetadata.reason).toContain('compliance');
    expect(archivedPOV.archiveMetadata.retentionUntil).toBeInstanceOf(Date);

    // Verify POV is no longer in active listings
    const activePOVs = await povService.listPOVs({
      consultant: 'user-dc-001',
      excludeArchived: true
    }, { auth: userToken });

    expect(activePOVs.povs.map(p => p.id)).not.toContain(pov.id);

    // Verify POV can still be retrieved directly (for compliance)
    const retrievedArchivedPOV = await povService.getPOV(
      pov.id, 
      { includeArchived: true, auth: userToken }
    );

    expect(retrievedArchivedPOV.id).toBe(pov.id);
    expect(retrievedArchivedPOV.status).toBe('archived');

    // Verify attachments are preserved
    expect(retrievedArchivedPOV.attachments).toContain(attachment.id);
    const attachmentUrl = await povService.getAttachmentDownloadUrl(
      pov.id,
      attachment.id,
      { includeArchived: true, auth: userToken }
    );
    expect(attachmentUrl).toBeDefined();

    // Test compliance export
    const complianceExport = await povService.generateComplianceExport(
      pov.id,
      { includeAttachments: true, auth: mgmtToken }
    );

    expect(complianceExport.povData).toEqual(expect.objectContaining({
      id: pov.id,
      title: 'POV for Archival',
      status: 'archived'
    }));
    expect(complianceExport.attachments).toHaveLength(1);
    expect(complianceExport.auditTrail).toBeDefined();
    expect(complianceExport.exportMetadata.exportedBy).toBe('mgmt-dc-001');
  });
});