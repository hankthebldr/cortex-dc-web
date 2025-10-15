/**
 * Test Record Management Workflow
 * Tests POV and TRR creation, lifecycle management, and relationships
 */

import { dynamicRecordService, relationshipManagementService } from '@cortex/db';

async function testRecordWorkflow() {
  console.log('🧪 Testing Record Management Workflow...\n');

  // Create Project
  console.log('📋 1. Creating project...');
  const projectId = 'test-project-' + Date.now();

  // Create POV
  console.log('📝 2. Creating POV...');
  const povResult = await dynamicRecordService.createPOV({
    title: 'Test POV - Q4 Demo',
    description: 'Testing POV creation and lifecycle',
    priority: 'high'
  }, projectId, {
    userId: 'test-user',
    autoPopulateDefaults: true,
    createRelationships: true
  });

  if (!povResult.success) {
    console.error('❌ Failed to create POV:', povResult.error);
    return;
  }

  console.log('✅ POV created:', povResult.povId);

  // Create TRR
  console.log('\n🔒 3. Creating TRR...');
  const trrResult = await dynamicRecordService.createTRR({
    title: 'Security Risk Assessment',
    description: 'Comprehensive security review',
    priority: 'critical'
  }, projectId, povResult.povId, {
    userId: 'test-user',
    createRelationships: true
  });

  if (!trrResult.success) {
    console.error('❌ Failed to create TRR:', trrResult.error);
    return;
  }

  console.log('✅ TRR created:', trrResult.trrId);

  // Verify relationships
  console.log('\n🔗 4. Verifying relationships...');
  const graph = await relationshipManagementService.getProjectRelationshipGraph(projectId);
  console.log('✅ POVs in project:', graph?.povs.length);
  console.log('✅ TRRs in project:', graph?.trrs.length);
  console.log('✅ POV → TRR links:', Object.keys(graph?.relationships.povToTRR || {}).length);

  // Validate relationships
  console.log('\n🔍 5. Validating relationships...');
  const validation = await relationshipManagementService.validateRelationships(projectId);
  console.log('✅ Relationships valid:', validation.valid);

  if (validation.errors.length > 0) {
    console.log('❌ Errors found:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:', validation.warnings);
  }

  // Transition POV phase
  console.log('\n🔄 6. Transitioning POV phase...');
  const phaseTransition = await dynamicRecordService.transitionPOVPhase(
    povResult.povId!,
    'test-user'
  );

  if (phaseTransition.success) {
    console.log('✅ POV transitioned to:', phaseTransition.nextPhase);
  } else {
    console.error('❌ Phase transition failed:', phaseTransition.error);
  }

  // Update TRR status
  console.log('\n📊 7. Updating TRR status...');
  const statusUpdate = await dynamicRecordService.transitionTRRStatus(
    trrResult.trrId!,
    'in_review',
    'test-user'
  );

  if (statusUpdate.success) {
    console.log('✅ TRR status updated to: in_review');
  } else {
    console.error('❌ Status update failed:', statusUpdate.error);
  }

  // Auto-populate POV records
  console.log('\n🤖 8. Auto-populating related records...');
  const autoPopulate = await dynamicRecordService.autoPopulatePOVRecords(
    povResult.povId!,
    'test-user'
  );
  console.log('✅ Created records:', autoPopulate.created);

  if (autoPopulate.errors.length > 0) {
    console.log('❌ Errors:', autoPopulate.errors);
  }

  // Final relationship graph
  console.log('\n📈 9. Final relationship graph...');
  const finalGraph = await relationshipManagementService.getProjectRelationshipGraph(projectId);
  console.log('✅ Total POVs:', finalGraph?.povs.length);
  console.log('✅ Total TRRs:', finalGraph?.trrs.length);
  console.log('✅ Total Scenarios:', finalGraph?.scenarios.length);

  console.log('\n✅ Workflow test completed successfully!');
  console.log('\n📊 Test Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Project ID:', projectId);
  console.log('POV ID:', povResult.povId);
  console.log('TRR ID:', trrResult.trrId);
  console.log('Relationships Valid:', validation.valid);
  console.log('Auto-populated Records:', autoPopulate.created.length);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run the test
testRecordWorkflow().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
