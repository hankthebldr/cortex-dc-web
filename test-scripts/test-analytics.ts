/**
 * Test Analytics Service
 * Tests user and admin analytics functionality
 */

import { analyticsService } from '@cortex/db';

async function testAnalytics() {
  console.log('📊 Testing Analytics Service...\n');

  // Get user analytics
  console.log('👤 1. Fetching user analytics...');
  const userAnalytics = await analyticsService.getUserAnalytics(
    'test-user',
    'month'
  );

  console.log('✅ User Metrics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Total POVs:', userAnalytics.metrics.totalPOVs);
  console.log('  Active POVs:', userAnalytics.metrics.activePOVs);
  console.log('  Completed POVs:', userAnalytics.metrics.completedPOVs);
  console.log('  Total TRRs:', userAnalytics.metrics.totalTRRs);
  console.log('  Completed TRRs:', userAnalytics.metrics.completedTRRs);
  console.log('  Total Projects:', userAnalytics.metrics.totalProjects);
  console.log('  Active Projects:', userAnalytics.metrics.activeProjects);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get admin analytics
  console.log('👑 2. Fetching admin analytics...');
  const adminAnalytics = await analyticsService.getAdminAnalytics('month');

  console.log('✅ System Metrics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Total Users:', adminAnalytics.systemMetrics.totalUsers);
  console.log('  Active Users:', adminAnalytics.systemMetrics.activeUsers);
  console.log('  New Users:', adminAnalytics.systemMetrics.newUsers);
  console.log('  Total POVs:', adminAnalytics.systemMetrics.totalPOVs);
  console.log('  Active POVs:', adminAnalytics.systemMetrics.activePOVs);
  console.log('  Total TRRs:', adminAnalytics.systemMetrics.totalTRRs);
  console.log('  Pending TRRs:', adminAnalytics.systemMetrics.pendingTRRs);
  console.log('  Total Projects:', adminAnalytics.systemMetrics.totalProjects);
  console.log('  Active Projects:', adminAnalytics.systemMetrics.activeProjects);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📈 3. Project Health:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Good:', adminAnalytics.projectHealth.good);
  console.log('  Warning:', adminAnalytics.projectHealth.warning);
  console.log('  At Risk:', adminAnalytics.projectHealth.atRisk);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🏆 4. Top Users:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  adminAnalytics.topUsers.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.displayName}`);
    console.log(`     POVs: ${user.povsCreated}, TRRs: ${user.trrsCompleted}, Score: ${user.activityScore}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📅 5. Recent Activity (User):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  userAnalytics.recentActivity.slice(0, 5).forEach((activity) => {
    const date = new Date(activity.timestamp).toLocaleString();
    console.log(`  ${activity.action} ${activity.type}: ${activity.entityTitle}`);
    console.log(`  ${date}\n`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Analytics test completed!');
}

// Run the test
testAnalytics().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
