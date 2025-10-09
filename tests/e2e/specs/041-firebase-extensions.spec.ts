import { test, expect } from '@playwright/test';
import { signIn, signOut } from '../utils/auth-helpers';

test.describe('Firebase Extensions - Feature Enhancement Tests', () => {
  
  test.describe('Multimodal Processing Extension', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'admin1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Configure multimodal processing extension', async ({ page }) => {
      // Navigate to Firebase Extensions management
      await page.getByTestId('admin-settings-tab').click();
      await page.getByTestId('firebase-extensions-section').click();
      await expect(page.getByTestId('extensions-dashboard')).toBeVisible();

      // Install multimodal processing extension
      await page.getByTestId('install-extension-button').click();
      await page.getByTestId('extension-marketplace').scrollIntoViewIfNeeded();
      
      await page.getByTestId('search-extensions-input').fill('multimodal-ai-processing');
      await page.getByTestId('search-extensions-button').click();
      
      // Select multimodal extension
      await expect(page.getByTestId('multimodal-extension-card')).toBeVisible();
      await page.getByTestId('multimodal-extension-card').click();
      
      // Configure extension parameters
      await expect(page.getByTestId('extension-config-dialog')).toBeVisible();
      await page.getByTestId('vertex-ai-project-id').fill('cortex-dc-web-dev');
      await page.getByTestId('vertex-ai-location').click();
      await page.getByTestId('location-us-central1').click();
      
      // Supported modalities configuration
      await page.getByTestId('enable-text-processing').check();
      await page.getByTestId('enable-image-analysis').check();
      await page.getByTestId('enable-video-processing').check();
      await page.getByTestId('enable-audio-transcription').check();
      await page.getByTestId('enable-document-parsing').check();
      
      // Processing models configuration
      await page.getByTestId('text-model-select').click();
      await page.getByTestId('model-gemini-pro').click();
      
      await page.getByTestId('image-model-select').click();
      await page.getByTestId('model-gemini-vision').click();
      
      await page.getByTestId('video-model-select').click();
      await page.getByTestId('model-vertex-video-ai').click();
      
      // Storage configuration
      await page.getByTestId('input-bucket-name').fill('multimodal-input-bucket');
      await page.getByTestId('output-bucket-name').fill('multimodal-output-bucket');
      await page.getByTestId('processed-data-collection').fill('processed_multimodal_data');
      
      // Install extension
      await page.getByTestId('install-extension-submit').click();
      await expect(page.getByTestId('extension-installation-progress')).toBeVisible();
      
      // Wait for installation completion
      await expect(page.getByTestId('extension-installation-success')).toBeVisible({ timeout: 60000 });
      await expect(page.getByTestId('multimodal-extension-status')).toContainText('Active');
      
      console.log('✅ Multimodal processing extension configured');
    });

    test('Process mixed media content through multimodal pipeline', async ({ page }) => {
      // Navigate to content processing interface
      await page.getByTestId('content-processing-tab').click();
      await expect(page.getByTestId('multimodal-processor')).toBeVisible();

      // Create new multimodal processing job
      await page.getByTestId('create-processing-job-button').click();
      await expect(page.getByTestId('processing-job-wizard')).toBeVisible();
      
      await page.getByTestId('job-name-input').fill('Customer Presentation Analysis');
      await page.getByTestId('job-description-input').fill('Analyze customer presentation materials for key insights and technical requirements');
      
      // Upload mixed media files
      await page.getByTestId('upload-content-section').scrollIntoViewIfNeeded();
      
      // Upload presentation document
      const docInput = page.getByTestId('document-upload-input');
      await docInput.setInputFiles({
        name: 'customer-presentation.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake-pdf-data')
      });
      
      // Upload architecture diagram
      const imageInput = page.getByTestId('image-upload-input');
      await imageInput.setInputFiles({
        name: 'network-architecture.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data')
      });
      
      // Upload demo video
      const videoInput = page.getByTestId('video-upload-input');
      await videoInput.setInputFiles({
        name: 'product-demo.mp4',
        mimeType: 'video/mp4',
        buffer: Buffer.from('fake-video-data')
      });
      
      // Upload audio recording
      const audioInput = page.getByTestId('audio-upload-input');
      await audioInput.setInputFiles({
        name: 'customer-interview.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from('fake-audio-data')
      });
      
      // Verify uploads
      await expect(page.getByTestId('uploaded-files-list')).toContainText('customer-presentation.pdf');
      await expect(page.getByTestId('uploaded-files-list')).toContainText('network-architecture.png');
      await expect(page.getByTestId('uploaded-files-list')).toContainText('product-demo.mp4');
      await expect(page.getByTestId('uploaded-files-list')).toContainText('customer-interview.wav');
      
      // Configure processing instructions
      await page.getByTestId('processing-instructions-section').scrollIntoViewIfNeeded();
      await page.getByTestId('processing-instructions-text').fill(`
Please analyze all uploaded content and provide:

1. Document Analysis:
   - Extract key technical requirements
   - Identify security concerns and compliance needs
   - Summarize business objectives and success criteria

2. Image Analysis:
   - Analyze network architecture diagrams
   - Identify security gaps and optimization opportunities
   - Extract technical specifications and component details

3. Video Analysis:
   - Transcribe product demonstrations
   - Extract feature requirements and use cases
   - Identify integration points and technical dependencies

4. Audio Analysis:
   - Transcribe customer interview content
   - Extract pain points and business requirements
   - Identify decision criteria and evaluation factors

Provide comprehensive analysis with actionable recommendations.
      `);
      
      // Configure output format
      await page.getByTestId('output-format-section').scrollIntoViewIfNeeded();
      await page.getByTestId('generate-summary-report').check();
      await page.getByTestId('generate-technical-specs').check();
      await page.getByTestId('generate-requirements-matrix').check();
      await page.getByTestId('generate-recommendations').check();
      
      // Start processing
      await page.getByTestId('start-processing-button').click();
      await expect(page.getByTestId('processing-job-started')).toBeVisible();
      
      // Monitor processing progress
      await expect(page.getByTestId('processing-status')).toContainText('In Progress');
      await expect(page.getByTestId('processing-progress-bar')).toBeVisible();
      
      // Wait for processing completion
      await expect(page.getByTestId('processing-complete-notification')).toBeVisible({ timeout: 120000 });
      await expect(page.getByTestId('processing-status')).toContainText('Completed');
      
      // Verify results
      await page.getByTestId('view-results-button').click();
      await expect(page.getByTestId('multimodal-results-dashboard')).toBeVisible();
      
      await expect(page.getByTestId('document-analysis-results')).toBeVisible();
      await expect(page.getByTestId('image-analysis-results')).toBeVisible();
      await expect(page.getByTestId('video-analysis-results')).toBeVisible();
      await expect(page.getByTestId('audio-analysis-results')).toBeVisible();
      
      console.log('✅ Multimodal content processing validated');
    });

    test('Multimodal processing quality validation and insights extraction', async ({ page }) => {
      // Navigate to completed processing job
      await page.getByTestId('processing-history-tab').click();
      const processingJob = page.getByTestId('processing-job-card').first();
      await processingJob.click();
      
      // Validate processing quality
      await page.getByTestId('quality-validation-tab').click();
      await expect(page.getByTestId('quality-metrics-dashboard')).toBeVisible();
      
      // Check confidence scores
      await expect(page.getByTestId('document-confidence-score')).toBeVisible();
      await expect(page.getByTestId('image-confidence-score')).toBeVisible();
      await expect(page.getByTestId('video-confidence-score')).toBeVisible();
      await expect(page.getByTestId('audio-confidence-score')).toBeVisible();
      
      // Validate extracted insights
      await page.getByTestId('insights-extraction-tab').click();
      
      // Technical requirements extraction
      await expect(page.getByTestId('technical-requirements-section')).toBeVisible();
      await expect(page.getByTestId('technical-requirements-list')).toBeVisible();
      
      // Business objectives extraction  
      await expect(page.getByTestId('business-objectives-section')).toBeVisible();
      await expect(page.getByTestId('business-objectives-list')).toBeVisible();
      
      // Security requirements extraction
      await expect(page.getByTestId('security-requirements-section')).toBeVisible();
      await expect(page.getByTestId('security-requirements-list')).toBeVisible();
      
      // Generate insights summary
      await page.getByTestId('generate-insights-summary-button').click();
      await expect(page.getByTestId('insights-generation-progress')).toBeVisible();
      
      await expect(page.getByTestId('insights-summary-complete')).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId('consolidated-insights-report')).toBeVisible();
      
      console.log('✅ Multimodal processing quality and insights validated');
    });
  });

  test.describe('BigQuery Streaming Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'admin1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Configure BigQuery streaming extension', async ({ page }) => {
      // Navigate to data streaming configuration
      await page.getByTestId('data-analytics-tab').click();
      await page.getByTestId('bigquery-streaming-section').click();
      await expect(page.getByTestId('streaming-configuration-panel')).toBeVisible();

      // Install BigQuery streaming extension
      await page.getByTestId('install-streaming-extension-button').click();
      await expect(page.getByTestId('streaming-extension-config')).toBeVisible();
      
      // Configure BigQuery connection
      await page.getByTestId('bigquery-project-id').fill('cortex-dc-analytics');
      await page.getByTestId('bigquery-dataset-name').fill('cortex_dc_analytics');
      await page.getByTestId('bigquery-location').click();
      await page.getByTestId('location-us-central1').click();
      
      // Configure streaming tables
      await page.getByTestId('add-streaming-table-button').click();
      await page.getByTestId('table-name-0').fill('user_activities');
      await page.getByTestId('table-schema-0').fill(`[
  {"name": "user_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "activity_type", "type": "STRING", "mode": "REQUIRED"},
  {"name": "timestamp", "type": "TIMESTAMP", "mode": "REQUIRED"},
  {"name": "session_id", "type": "STRING", "mode": "NULLABLE"},
  {"name": "metadata", "type": "JSON", "mode": "NULLABLE"}
]`);
      
      await page.getByTestId('add-streaming-table-button').click();
      await page.getByTestId('table-name-1').fill('pov_analytics');
      await page.getByTestId('table-schema-1').fill(`[
  {"name": "pov_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "stage", "type": "STRING", "mode": "REQUIRED"},
  {"name": "duration_minutes", "type": "INTEGER", "mode": "NULLABLE"},
  {"name": "success_metrics", "type": "JSON", "mode": "NULLABLE"},
  {"name": "created_at", "type": "TIMESTAMP", "mode": "REQUIRED"}
]`);
      
      await page.getByTestId('add-streaming-table-button').click();
      await page.getByTestId('table-name-2').fill('trr_workflow_metrics');
      await page.getByTestId('table-schema-2').fill(`[
  {"name": "trr_id", "type": "STRING", "mode": "REQUIRED"},
  {"name": "workflow_stage", "type": "STRING", "mode": "REQUIRED"},
  {"name": "approval_time_hours", "type": "FLOAT", "mode": "NULLABLE"},
  {"name": "reviewer_role", "type": "STRING", "mode": "REQUIRED"},
  {"name": "risk_score", "type": "FLOAT", "mode": "NULLABLE"}
]`);
      
      // Configure streaming triggers
      await page.getByTestId('streaming-triggers-section').scrollIntoViewIfNeeded();
      await page.getByTestId('enable-firestore-triggers').check();
      await page.getByTestId('enable-auth-triggers').check();
      await page.getByTestId('enable-storage-triggers').check();
      await page.getByTestId('enable-functions-triggers').check();
      
      // Configure batch settings
      await page.getByTestId('batch-settings-section').scrollIntoViewIfNeeded();
      await page.getByTestId('batch-size-input').fill('100');
      await page.getByTestId('batch-timeout-seconds').fill('10');
      await page.getByTestId('max-outstanding-elements').fill('1000');
      
      // Install and configure
      await page.getByTestId('install-streaming-extension').click();
      await expect(page.getByTestId('streaming-installation-progress')).toBeVisible();
      
      await expect(page.getByTestId('streaming-extension-active')).toBeVisible({ timeout: 60000 });
      await expect(page.getByTestId('streaming-status')).toContainText('Active');
      
      console.log('✅ BigQuery streaming extension configured');
    });

    test('Validate real-time data streaming to BigQuery', async ({ page }) => {
      // Generate test data activity
      await page.getByTestId('user-dashboard-tab').click();
      await page.getByTestId('create-pov-button').click();
      await page.getByTestId('pov-title-input').fill('Streaming Test POV');
      await page.getByTestId('pov-description-textarea').fill('POV created to test BigQuery streaming');
      await page.getByTestId('next-step-button').click();
      
      // Add some activity to generate streaming data
      await page.getByTestId('add-objective-button').click();
      await page.getByTestId('objective-title-0').fill('Test Objective');
      await page.getByTestId('save-wizard-draft').click();
      
      // Navigate to streaming monitoring
      await page.getByTestId('data-analytics-tab').click();
      await page.getByTestId('streaming-monitor-tab').click();
      await expect(page.getByTestId('streaming-dashboard')).toBeVisible();
      
      // Check streaming metrics
      await expect(page.getByTestId('total-records-streamed')).toBeVisible();
      await expect(page.getByTestId('streaming-throughput')).toBeVisible();
      await expect(page.getByTestId('error-rate')).toBeVisible();
      
      // View streaming data by table
      await page.getByTestId('user-activities-table-metrics').click();
      await expect(page.getByTestId('table-streaming-stats')).toBeVisible();
      await expect(page.getByTestId('recent-records-count')).toBeVisible();
      await expect(page.getByTestId('last-insert-timestamp')).toBeVisible();
      
      await page.getByTestId('pov-analytics-table-metrics').click();
      await expect(page.getByTestId('table-streaming-stats')).toBeVisible();
      
      // Verify data quality
      await page.getByTestId('data-quality-tab').click();
      await expect(page.getByTestId('data-quality-dashboard')).toBeVisible();
      await expect(page.getByTestId('schema-validation-status')).toContainText('Valid');
      await expect(page.getByTestId('data-completeness-score')).toBeVisible();
      await expect(page.getByTestId('duplicate-detection-results')).toBeVisible();
      
      console.log('✅ Real-time BigQuery streaming validated');
    });

    test('BigQuery analytics dashboards and insights', async ({ page }) => {
      // Navigate to analytics dashboards
      await page.getByTestId('analytics-dashboards-tab').click();
      await expect(page.getByTestId('analytics-dashboard-selector')).toBeVisible();

      // User engagement analytics
      await page.getByTestId('user-engagement-dashboard').click();
      await expect(page.getByTestId('engagement-metrics-panel')).toBeVisible();
      
      await expect(page.getByTestId('daily-active-users-chart')).toBeVisible();
      await expect(page.getByTestId('feature-usage-distribution')).toBeVisible();
      await expect(page.getByTestId('session-duration-trends')).toBeVisible();
      await expect(page.getByTestId('user-journey-flow')).toBeVisible();
      
      // POV performance analytics
      await page.getByTestId('pov-performance-dashboard').click();
      await expect(page.getByTestId('pov-metrics-panel')).toBeVisible();
      
      await expect(page.getByTestId('pov-completion-rates')).toBeVisible();
      await expect(page.getByTestId('time-to-completion-distribution')).toBeVisible();
      await expect(page.getByTestId('success-rate-by-industry')).toBeVisible();
      await expect(page.getByTestId('bottleneck-analysis')).toBeVisible();
      
      // TRR workflow analytics  
      await page.getByTestId('trr-workflow-dashboard').click();
      await expect(page.getByTestId('trr-workflow-panel')).toBeVisible();
      
      await expect(page.getByTestId('approval-time-trends')).toBeVisible();
      await expect(page.getByTestId('risk-score-distribution')).toBeVisible();
      await expect(page.getByTestId('reviewer-performance')).toBeVisible();
      await expect(page.getByTestId('workflow-efficiency-metrics')).toBeVisible();
      
      // Generate insights report
      await page.getByTestId('generate-insights-report-button').click();
      await expect(page.getByTestId('insights-generation-dialog')).toBeVisible();
      
      await page.getByTestId('report-date-range').click();
      await page.getByTestId('date-range-last-30-days').click();
      
      await page.getByTestId('include-user-analytics').check();
      await page.getByTestId('include-pov-analytics').check();
      await page.getByTestId('include-trr-analytics').check();
      await page.getByTestId('include-predictive-insights').check();
      
      await page.getByTestId('generate-report-submit').click();
      await expect(page.getByTestId('report-generation-progress')).toBeVisible();
      
      // Wait for report generation
      await expect(page.getByTestId('insights-report-ready')).toBeVisible({ timeout: 45000 });
      await page.getByTestId('view-insights-report-button').click();
      
      // Validate report content
      await expect(page.getByTestId('executive-summary-section')).toBeVisible();
      await expect(page.getByTestId('key-metrics-section')).toBeVisible();
      await expect(page.getByTestId('trend-analysis-section')).toBeVisible();
      await expect(page.getByTestId('recommendations-section')).toBeVisible();
      await expect(page.getByTestId('predictive-insights-section')).toBeVisible();
      
      console.log('✅ BigQuery analytics and insights validated');
    });

    test('Streaming data pipeline monitoring and alerting', async ({ page }) => {
      // Navigate to pipeline monitoring
      await page.getByTestId('pipeline-monitoring-tab').click();
      await expect(page.getByTestId('pipeline-health-dashboard')).toBeVisible();

      // Configure monitoring alerts
      await page.getByTestId('configure-alerts-button').click();
      await expect(page.getByTestId('alert-configuration-dialog')).toBeVisible();
      
      // Set up throughput alerts
      await page.getByTestId('add-alert-rule-button').click();
      await page.getByTestId('alert-name-0').fill('Low Throughput Alert');
      await page.getByTestId('alert-metric-0').click();
      await page.getByTestId('metric-throughput').click();
      await page.getByTestId('alert-condition-0').click();
      await page.getByTestId('condition-less-than').click();
      await page.getByTestId('alert-threshold-0').fill('10');
      await page.getByTestId('alert-duration-0').fill('5');
      
      // Set up error rate alerts
      await page.getByTestId('add-alert-rule-button').click();
      await page.getByTestId('alert-name-1').fill('High Error Rate Alert');
      await page.getByTestId('alert-metric-1').click();
      await page.getByTestId('metric-error-rate').click();
      await page.getByTestId('alert-condition-1').click();
      await page.getByTestId('condition-greater-than').click();
      await page.getByTestId('alert-threshold-1').fill('5');
      await page.getByTestId('alert-duration-1').fill('2');
      
      // Set up notification channels
      await page.getByTestId('notification-channels-section').scrollIntoViewIfNeeded();
      await page.getByTestId('enable-email-notifications').check();
      await page.getByTestId('email-recipients').fill('admin@company.com,devops@company.com');
      await page.getByTestId('enable-slack-notifications').check();
      await page.getByTestId('slack-webhook-url').fill('https://hooks.slack.com/test-webhook');
      
      await page.getByTestId('save-alert-configuration').click();
      await expect(page.getByTestId('alerts-configured-success')).toBeVisible();
      
      // View pipeline performance metrics
      await expect(page.getByTestId('pipeline-latency-chart')).toBeVisible();
      await expect(page.getByTestId('throughput-trends-chart')).toBeVisible();
      await expect(page.getByTestId('error-distribution-chart')).toBeVisible();
      await expect(page.getByTestId('resource-utilization-chart')).toBeVisible();
      
      // Check system health indicators
      await expect(page.getByTestId('pipeline-health-status')).toContainText('Healthy');
      await expect(page.getByTestId('data-freshness-indicator')).toBeVisible();
      await expect(page.getByTestId('backlog-size-indicator')).toBeVisible();
      
      console.log('✅ Streaming pipeline monitoring and alerting validated');
    });
  });
});