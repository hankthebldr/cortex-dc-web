import { getAdminFirestore, getAdminStorage } from './adminApp.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export async function seedCoreData() {
  console.log('🌱 Seeding core test data...');
  const db = getAdminFirestore();
  const bucket = getAdminStorage().bucket('cortex-dc-web-dev.appspot.com');

  // Namespace for e2e tests
  const ns = 'e2e';

  try {
    // Seed Projects collection
    const projectsRef = db.collection('projects');
    const projectId = 'proj-e2e-1';
    
    await projectsRef.doc(projectId).set({
      ns,
      name: 'E2E Test Project 1',
      customer: { 
        name: 'Acme Corporation', 
        industry: 'Manufacturing',
        size: 'Enterprise'
      },
      team: [
        { email: 'user1@dev.local', role: 'user' },
        { email: 'manager1@dev.local', role: 'manager' }
      ],
      createdAt: Date.now(),
      status: 'active',
      description: 'Test project for E2E automation',
      timeline: {
        start: Date.now(),
        end: Date.now() + (90 * 24 * 60 * 60 * 1000), // 90 days
        milestones: [
          { name: 'Planning', date: Date.now() + (7 * 24 * 60 * 60 * 1000) },
          { name: 'Execution', date: Date.now() + (30 * 24 * 60 * 60 * 1000) },
          { name: 'Review', date: Date.now() + (60 * 24 * 60 * 60 * 1000) }
        ]
      }
    }, { merge: true });
    console.log(`   ✓ Seeded project: ${projectId}`);

    // Seed POVs collection
    const povsRef = db.collection('povs');
    const povId = 'pov-e2e-1';
    
    await povsRef.doc(povId).set({
      ns,
      projectId,
      title: 'Zero Trust Network Architecture POV',
      customer: 'Acme Corporation',
      consultant: 'user1@dev.local',
      status: 'draft',
      objectives: [
        'Implement network segmentation',
        'Deploy identity verification',
        'Enable endpoint protection'
      ],
      scenarios: ['network-segmentation', 'identity-verification'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`   ✓ Seeded POV: ${povId}`);

    // Seed Scenarios collection
    const scenariosRef = db.collection('scenarios');
    const scenarios = [
      {
        id: 'network-segmentation',
        name: 'Network Segmentation',
        category: 'security',
        description: 'Implement micro-segmentation for network security',
        duration: 1800, // 30 minutes
        difficulty: 'intermediate'
      },
      {
        id: 'identity-verification',
        name: 'Identity Verification',
        category: 'identity',
        description: 'Deploy multi-factor authentication and identity governance',
        duration: 2400, // 40 minutes
        difficulty: 'advanced'
      }
    ];

    for (const scenario of scenarios) {
      await scenariosRef.doc(scenario.id).set({
        ...scenario,
        ns,
        povReferences: [povId],
        createdAt: Date.now()
      }, { merge: true });
      console.log(`   ✓ Seeded scenario: ${scenario.id}`);
    }

    // Seed Storage with sample file
    try {
      const samplePath = path.join(process.cwd(), 'tests/e2e/seed/sample.txt');
      const content = readFileSync(samplePath, 'utf-8');
      const storageRef = bucket.file(`${ns}/sample.txt`);
      
      await storageRef.save(content, { 
        metadata: { contentType: 'text/plain' } 
      });
      console.log(`   ✓ Seeded storage file: ${ns}/sample.txt`);
    } catch (error) {
      console.warn(`   ⚠️  Could not seed storage file (sample.txt not found):`, error.message);
    }

    console.log('✅ Core data seeding completed');
  } catch (error) {
    console.error('❌ Core data seeding failed:', error);
    throw error;
  }
}

// Allow direct execution
if (process.env.RUN_DIRECT === '1') {
  seedCoreData()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ Core data seeding failed:', e);
      process.exit(1);
    });
}