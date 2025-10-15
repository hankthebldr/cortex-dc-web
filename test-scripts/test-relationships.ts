/**
 * Test Relationship Management
 * Tests relationship validation and repair functionality
 */

import { relationshipManagementService } from '@cortex/db';

async function testRelationships(projectId: string) {
  console.log('🔗 Testing Relationship Management...\n');

  // Get relationship graph
  console.log('📊 1. Getting relationship graph...');
  const graph = await relationshipManagementService.getProjectRelationshipGraph(projectId);

  if (!graph) {
    console.error('❌ Project not found:', projectId);
    return;
  }

  console.log('✅ Project:', graph.projectId);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  POVs:', graph.povs.length);
  console.log('  TRRs:', graph.trrs.length);
  console.log('  Scenarios:', graph.scenarios.length);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Display POVs
  if (graph.povs.length > 0) {
    console.log('📝 POVs:');
    graph.povs.forEach((pov: any) => {
      console.log(`  - ${pov.title} (${pov.id})`);
      console.log(`    Status: ${pov.status}, Priority: ${pov.priority}`);
    });
    console.log();
  }

  // Display TRRs
  if (graph.trrs.length > 0) {
    console.log('🔒 TRRs:');
    graph.trrs.forEach((trr: any) => {
      console.log(`  - ${trr.title} (${trr.id})`);
      console.log(`    POV: ${trr.povId || 'Not linked'}`);
      console.log(`    Status: ${trr.status}, Priority: ${trr.priority}`);
    });
    console.log();
  }

  // Display relationships
  console.log('🔗 Relationships:');
  console.log('  POV → TRR:', Object.keys(graph.relationships.povToTRR).length);
  console.log('  POV → Scenario:', Object.keys(graph.relationships.povToScenario).length);
  console.log('  TRR → POV:', Object.keys(graph.relationships.trrToPOV).length);
  console.log('  Scenario → POV:', Object.keys(graph.relationships.scenarioToPOV).length);
  console.log();

  // Validate relationships
  console.log('🔍 2. Validating relationships...');
  const validation = await relationshipManagementService.validateRelationships(projectId);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Valid:', validation.valid ? '✅ YES' : '❌ NO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (validation.errors.length > 0) {
    console.log('❌ Errors:');
    validation.errors.forEach(err => console.log('  -', err));
    console.log();
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warn => console.log('  -', warn));
    console.log();
  }

  // Repair if needed
  if (!validation.valid) {
    console.log('🔧 3. Repairing relationships...');
    const repair = await relationshipManagementService.repairRelationships(projectId);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Fixed:', repair.fixed, 'issue(s)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (repair.errors.length > 0) {
      console.log('❌ Errors during repair:');
      repair.errors.forEach(err => console.log('  -', err));
      console.log();
    }

    // Validate again after repair
    console.log('🔍 4. Re-validating after repair...');
    const revalidation = await relationshipManagementService.validateRelationships(projectId);
    console.log('Valid after repair:', revalidation.valid ? '✅ YES' : '❌ NO');
    console.log();
  }

  // Test specific relationship queries
  console.log('🔎 5. Testing relationship queries...');

  if (graph.trrs.length > 0) {
    const firstTRR = graph.trrs[0];
    const pov = await relationshipManagementService.getPOVForTRR(firstTRR.id);
    console.log('✅ POV for TRR:', pov ? pov.title : 'None');
  }

  if (graph.povs.length > 0) {
    const firstPOV = graph.povs[0];
    const trrs = await relationshipManagementService.getTRRsForPOV(firstPOV.id);
    console.log('✅ TRRs for POV:', trrs.length);

    const scenarios = await relationshipManagementService.getScenariosForPOV(firstPOV.id);
    console.log('✅ Scenarios for POV:', scenarios.length);
  }

  console.log('\n✅ Relationship test completed!');
}

// Usage
const projectId = process.argv[2];

if (!projectId) {
  console.error('Usage: npx tsx test-scripts/test-relationships.ts <project-id>');
  console.error('\nExample:');
  console.error('  npx tsx test-scripts/test-relationships.ts test-project-1729000000000');
  process.exit(1);
}

testRelationships(projectId).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
