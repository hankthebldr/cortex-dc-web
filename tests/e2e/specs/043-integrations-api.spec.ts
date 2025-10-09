import { test, expect } from '@playwright/test';
import { signIn, signOut } from '../utils/auth-helpers';

test.describe('Integrations & API Support - Feature Enhancement Tests', () => {
  
  test.describe('Slack Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'admin1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Configure Slack workspace integration', async ({ page }) => {
      // Navigate to integrations management
      await page.getByTestId('integrations-tab').click();
      await page.getByTestId('slack-integration-section').click();
      await expect(page.getByTestId('slack-integration-dashboard')).toBeVisible();

      // Install Slack integration
      await page.getByTestId('install-slack-integration-button').click();
      await expect(page.getByTestId('slack-installation-wizard')).toBeVisible();

      // Slack workspace configuration
      await page.getByTestId('slack-workspace-url').fill('https://cortex-dc-team.slack.com');
      await page.getByTestId('slack-app-id').fill('A01234567890');
      await page.getByTestId('slack-client-id').fill('1234567890.1234567890123');
      
      // Bot configuration
      await page.getByTestId('slack-bot-name').fill('Cortex DC Assistant');
      await page.getByTestId('slack-bot-username').fill('cortex-dc-bot');
      
      // Channel mapping configuration
      await page.getByTestId('channel-mapping-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-channel-mapping-button').click();
      
      await page.getByTestId('channel-name-0').fill('#pov-notifications');
      await page.getByTestId('channel-purpose-0').click();
      await page.getByTestId('purpose-pov-updates').click();
      await page.getByTestId('notification-types-0').click();
      await page.getByTestId('notify-creation').check();
      await page.getByTestId('notify-completion').check();
      await page.getByTestId('notify-status-changes').check();
      
      await page.getByTestId('add-channel-mapping-button').click();
      await page.getByTestId('channel-name-1').fill('#trr-reviews');
      await page.getByTestId('channel-purpose-1').click();
      await page.getByTestId('purpose-trr-workflow').click();
      await page.getByTestId('notification-types-1').click();
      await page.getByTestId('notify-submitted-review').check();
      await page.getByTestId('notify-approval-decisions').check();
      await page.getByTestId('notify-signoff-completed').check();
      
      await page.getByTestId('add-channel-mapping-button').click();
      await page.getByTestId('channel-name-2').fill('#team-updates');
      await page.getByTestId('channel-purpose-2').click();
      await page.getByTestId('purpose-general-updates').click();
      await page.getByTestId('notification-types-2').click();
      await page.getByTestId('notify-system-alerts').check();
      await page.getByTestId('notify-user-mentions').check();
      
      // User role mapping
      await page.getByTestId('user-role-mapping-section').scrollIntoViewIfNeeded();
      await page.getByTestId('map-cortex-to-slack-users').check();
      await page.getByTestId('auto-invite-new-users').check();
      await page.getByTestId('sync-user-profiles').check();
      
      // Bot permissions and capabilities
      await page.getByTestId('bot-permissions-section').scrollIntoViewIfNeeded();
      await page.getByTestId('enable-interactive-commands').check();
      await page.getByTestId('enable-status-queries').check();
      await page.getByTestId('enable-report-generation').check();
      await page.getByTestId('enable-workflow-actions').check();
      
      // Slack OAuth authentication
      await page.getByTestId('authenticate-slack-button').click();
      
      // Mock Slack OAuth flow
      await expect(page.getByTestId('slack-oauth-redirect')).toBeVisible();
      await page.getByTestId('mock-slack-authorize-button').click();
      
      // Complete integration setup
      await expect(page.getByTestId('slack-auth-success')).toBeVisible();
      await page.getByTestId('complete-integration-setup').click();
      
      await expect(page.getByTestId('slack-integration-active')).toBeVisible();
      await expect(page.getByTestId('integration-status')).toContainText('Connected');
      
      console.log('✅ Slack workspace integration configured');
    });

    test('Slack bot commands and interactive features', async ({ page }) => {
      // Navigate to Slack bot testing interface
      await page.getByTestId('integrations-tab').click();
      await page.getByTestId('slack-bot-testing-section').click();
      await expect(page.getByTestId('slack-bot-simulator')).toBeVisible();

      // Test basic bot commands
      await page.getByTestId('simulate-slack-command').click();
      await page.getByTestId('slack-command-input').fill('/cortex status');
      await page.getByTestId('send-command-button').click();
      
      await expect(page.getByTestId('bot-response')).toBeVisible();
      await expect(page.getByTestId('bot-response')).toContainText('Cortex DC Status Dashboard');
      await expect(page.getByTestId('bot-response')).toContainText('Active POVs');
      await expect(page.getByTestId('bot-response')).toContainText('Pending TRRs');
      
      // Test POV queries
      await page.getByTestId('slack-command-input').fill('/cortex pov list');
      await page.getByTestId('send-command-button').click();
      
      await expect(page.getByTestId('bot-response')).toContainText('Current POV Projects');
      await expect(page.getByTestId('interactive-pov-list')).toBeVisible();
      
      // Test interactive POV actions
      await page.getByTestId('pov-action-button-0').click();
      await expect(page.getByTestId('pov-action-menu')).toBeVisible();
      await page.getByTestId('action-view-details').click();
      
      await expect(page.getByTestId('pov-details-modal')).toBeVisible();
      await expect(page.getByTestId('pov-title-display')).toBeVisible();
      await expect(page.getByTestId('pov-status-display')).toBeVisible();
      await expect(page.getByTestId('pov-timeline-display')).toBeVisible();
      
      // Test TRR workflow commands
      await page.getByTestId('slack-command-input').fill('/cortex trr pending');
      await page.getByTestId('send-command-button').click();
      
      await expect(page.getByTestId('bot-response')).toContainText('Pending TRR Reviews');
      await expect(page.getByTestId('interactive-trr-list')).toBeVisible();
      
      // Test report generation command
      await page.getByTestId('slack-command-input').fill('/cortex report weekly');
      await page.getByTestId('send-command-button').click();
      
      await expect(page.getByTestId('bot-response')).toContainText('Generating weekly report...');
      await expect(page.getByTestId('report-generation-progress')).toBeVisible();
      
      // Wait for report completion
      await expect(page.getByTestId('report-ready-notification')).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId('report-download-link')).toBeVisible();
      
      console.log('✅ Slack bot commands and features validated');
    });

    test('Slack notification delivery and formatting', async ({ page }) => {
      // Navigate to notification testing
      await page.getByTestId('integrations-tab').click();
      await page.getByTestId('notification-testing-section').click();

      // Create test POV to trigger notifications
      await page.getByTestId('create-test-pov-button').click();
      await page.getByTestId('test-pov-title').fill('Slack Notification Test POV');
      await page.getByTestId('test-pov-description').fill('POV created to test Slack notifications');
      await page.getByTestId('create-test-pov-submit').click();
      
      // Monitor Slack notification delivery
      await page.getByTestId('slack-notifications-monitor').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('recent-notifications-list')).toBeVisible();
      
      // Verify POV creation notification
      const povNotification = page.getByTestId('notification-pov-created').first();
      await expect(povNotification).toBeVisible();
      await expect(povNotification).toContainText('New POV Created');
      await expect(povNotification).toContainText('Slack Notification Test POV');
      await expect(povNotification).toContainText('#pov-notifications');
      
      // Test notification formatting
      await povNotification.click();
      await expect(page.getByTestId('notification-preview')).toBeVisible();
      await expect(page.getByTestId('slack-message-format')).toContainText('🚀 New POV Created');
      await expect(page.getByTestId('slack-message-attachments')).toBeVisible();
      await expect(page.getByTestId('slack-action-buttons')).toBeVisible();
      
      // Test TRR notification by changing POV status
      await page.getByTestId('change-pov-status-button').click();
      await page.getByTestId('new-status-select').click();
      await page.getByTestId('status-in-progress').click();
      await page.getByTestId('update-status-button').click();
      
      // Verify status change notification
      await expect(page.getByTestId('notification-pov-status-changed')).toBeVisible();
      await expect(page.getByTestId('notification-pov-status-changed')).toContainText('POV Status Updated');
      await expect(page.getByTestId('notification-pov-status-changed')).toContainText('In Progress');
      
      // Test notification delivery reliability
      await page.getByTestId('check-delivery-status-button').click();
      await expect(page.getByTestId('delivery-status-report')).toBeVisible();
      await expect(page.getByTestId('successful-deliveries')).toBeVisible();
      await expect(page.getByTestId('failed-deliveries')).toBeVisible();
      await expect(page.getByTestId('delivery-latency-metrics')).toBeVisible();
      
      console.log('✅ Slack notification delivery validated');
    });

    test('Slack workflow automation and triggers', async ({ page }) => {
      // Navigate to workflow automation
      await page.getByTestId('integrations-tab').click();
      await page.getByTestId('slack-automation-section').click();

      // Configure automated workflow triggers
      await page.getByTestId('create-automation-rule-button').click();
      await expect(page.getByTestId('automation-rule-wizard')).toBeVisible();
      
      // POV completion automation
      await page.getByTestId('rule-name-input').fill('POV Completion Celebration');
      await page.getByTestId('trigger-type-select').click();
      await page.getByTestId('trigger-pov-completed').click();
      
      await page.getByTestId('action-type-select').click();
      await page.getByTestId('action-send-message').click();
      
      await page.getByTestId('target-channel-select').click();
      await page.getByTestId('channel-team-updates').click();
      
      await page.getByTestId('message-template-textarea').fill(`
🎉 POV Completed Successfully! 🎉

**Project**: {{pov.title}}
**Customer**: {{pov.customer.name}}
**Completion Date**: {{pov.completedDate}}
**Duration**: {{pov.duration}} days
**Success Rate**: {{pov.successMetrics.overallScore}}%

Great work team! 👏 The customer is ready for the next phase.

📊 [View Full Report]({{pov.reportUrl}})
🚀 [Start Follow-up Activities]({{pov.followupUrl}})
      `);
      
      await page.getByTestId('create-automation-rule').click();
      await expect(page.getByTestId('automation-rule-created')).toBeVisible();
      
      // TRR approval automation
      await page.getByTestId('create-automation-rule-button').click();
      await page.getByTestId('rule-name-input').fill('TRR Approval Notification');
      await page.getByTestId('trigger-type-select').click();
      await page.getByTestId('trigger-trr-approved').click();
      
      await page.getByTestId('action-type-select').click();
      await page.getByTestId('action-send-rich-message').click();
      
      await page.getByTestId('target-channel-select').click();
      await page.getByTestId('channel-trr-reviews').click();
      
      // Configure rich message with interactive elements
      await page.getByTestId('rich-message-builder').scrollIntoViewIfNeeded();
      await page.getByTestId('add-section-button').click();
      await page.getByTestId('section-type-header').click();
      await page.getByTestId('header-text').fill('✅ TRR Approved');
      
      await page.getByTestId('add-section-button').click();
      await page.getByTestId('section-type-fields').click();
      await page.getByTestId('field-title-0').fill('TRR Title');
      await page.getByTestId('field-value-0').fill('{{trr.title}}');
      await page.getByTestId('field-short-0').check();
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-title-1').fill('Risk Score');
      await page.getByTestId('field-value-1').fill('{{trr.overallRiskScore}}');
      await page.getByTestId('field-short-1').check();
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-title-2').fill('Approved By');
      await page.getByTestId('field-value-2').fill('{{trr.approvedBy}}');
      await page.getByTestId('field-short-2').check();
      
      // Add action buttons
      await page.getByTestId('add-actions-section').click();
      await page.getByTestId('action-button-text-0').fill('View TRR Details');
      await page.getByTestId('action-button-url-0').fill('{{trr.detailsUrl}}');
      await page.getByTestId('action-button-style-0').click();
      await page.getByTestId('button-style-primary').click();
      
      await page.getByTestId('add-action-button').click();
      await page.getByTestId('action-button-text-1').fill('Download Report');
      await page.getByTestId('action-button-url-1').fill('{{trr.reportUrl}}');
      
      await page.getByTestId('create-automation-rule').click();
      await expect(page.getByTestId('automation-rule-created')).toBeVisible();
      
      // Test automation rule execution
      await page.getByTestId('test-automation-rules-button').click();
      await page.getByTestId('select-test-trigger').click();
      await page.getByTestId('test-pov-completed').click();
      await page.getByTestId('execute-test-button').click();
      
      await expect(page.getByTestId('automation-test-results')).toBeVisible();
      await expect(page.getByTestId('test-message-preview')).toContainText('POV Completed Successfully');
      await expect(page.getByTestId('test-delivery-status')).toContainText('Would deliver to #team-updates');
      
      console.log('✅ Slack workflow automation validated');
    });
  });

  test.describe('User-Defined Credential Management System', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'admin1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Create and manage secure credential vault', async ({ page }) => {
      // Navigate to credential management
      await page.getByTestId('security-settings-tab').click();
      await page.getByTestId('credential-management-section').click();
      await expect(page.getByTestId('credential-vault-dashboard')).toBeVisible();

      // Initialize credential vault
      await page.getByTestId('initialize-vault-button').click();
      await expect(page.getByTestId('vault-initialization-wizard')).toBeVisible();
      
      // Set up master encryption key
      await page.getByTestId('vault-name-input').fill('Cortex DC Credential Vault');
      await page.getByTestId('vault-description-textarea').fill('Secure storage for API keys, service credentials, and integration secrets');
      
      // Configure encryption settings
      await page.getByTestId('encryption-method-select').click();
      await page.getByTestId('encryption-aes-256').click();
      
      await page.getByTestId('key-derivation-select').click();
      await page.getByTestId('kdf-pbkdf2').click();
      
      await page.getByTestId('vault-master-password').fill('SecureVaultPassword2024!');
      await page.getByTestId('confirm-master-password').fill('SecureVaultPassword2024!');
      
      // Configure access policies
      await page.getByTestId('access-policies-section').scrollIntoViewIfNeeded();
      await page.getByTestId('require-admin-approval').check();
      await page.getByTestId('enable-audit-logging').check();
      await page.getByTestId('require-mfa-access').check();
      await page.getByTestId('session-timeout-minutes').fill('30');
      
      // Set up backup and recovery
      await page.getByTestId('backup-settings-section').scrollIntoViewIfNeeded();
      await page.getByTestId('enable-automated-backup').check();
      await page.getByTestId('backup-frequency-select').click();
      await page.getByTestId('backup-daily').click();
      await page.getByTestId('backup-retention-days').fill('90');
      
      // Generate recovery keys
      await page.getByTestId('generate-recovery-keys-button').click();
      await expect(page.getByTestId('recovery-keys-generated')).toBeVisible();
      
      // Download recovery keys securely
      await page.getByTestId('download-recovery-keys-button').click();
      await expect(page.getByTestId('recovery-keys-downloaded')).toBeVisible();
      
      // Initialize vault
      await page.getByTestId('initialize-vault-submit').click();
      await expect(page.getByTestId('vault-initialization-progress')).toBeVisible();
      
      await expect(page.getByTestId('vault-initialized-success')).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId('vault-status')).toContainText('Active');
      
      console.log('✅ Secure credential vault initialized');
    });

    test('Store and retrieve API credentials securely', async ({ page }) => {
      // Access credential vault
      await page.getByTestId('security-settings-tab').click();
      await page.getByTestId('credential-management-section').click();
      await page.getByTestId('unlock-vault-button').click();
      
      // Unlock vault with master password
      await page.getByTestId('master-password-input').fill('SecureVaultPassword2024!');
      await page.getByTestId('unlock-vault-submit').click();
      await expect(page.getByTestId('vault-unlocked')).toBeVisible();

      // Add Slack API credentials
      await page.getByTestId('add-credential-button').click();
      await expect(page.getByTestId('credential-creation-form')).toBeVisible();
      
      await page.getByTestId('credential-name-input').fill('Slack API Integration');
      await page.getByTestId('credential-category-select').click();
      await page.getByTestId('category-api-keys').click();
      
      await page.getByTestId('credential-description-textarea').fill('API credentials for Slack workspace integration and bot functionality');
      
      // Add credential fields
      await page.getByTestId('add-credential-field-button').click();
      await page.getByTestId('field-name-0').fill('Bot Token');
      await page.getByTestId('field-type-0').click();
      await page.getByTestId('field-type-secret').click();
      await page.getByTestId('field-value-0').fill('xoxb-1234567890-1234567890123-abcdefghijklmnopqrstuvwxyz');
      
      await page.getByTestId('add-credential-field-button').click();
      await page.getByTestId('field-name-1').fill('App Token');
      await page.getByTestId('field-type-1').click();
      await page.getByTestId('field-type-secret').click();
      await page.getByTestId('field-value-1').fill('xapp-1-A01234567890-1234567890123-abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
      
      await page.getByTestId('add-credential-field-button').click();
      await page.getByTestId('field-name-2').fill('Signing Secret');
      await page.getByTestId('field-type-2').click();
      await page.getByTestId('field-type-secret').click();
      await page.getByTestId('field-value-2').fill('1234567890abcdefghijklmnopqrstuvwxyz1234');
      
      await page.getByTestId('add-credential-field-button').click();
      await page.getByTestId('field-name-3').fill('Client ID');
      await page.getByTestId('field-type-3').click();
      await page.getByTestId('field-type-text').click();
      await page.getByTestId('field-value-3').fill('1234567890.1234567890123');
      
      // Set access permissions
      await page.getByTestId('access-permissions-section').scrollIntoViewIfNeeded();
      await page.getByTestId('allowed-roles-multiselect').click();
      await page.getByTestId('role-admin').check();
      await page.getByTestId('role-integration-manager').check();
      await page.getByTestId('apply-roles-selection').click();
      
      // Set usage restrictions
      await page.getByTestId('usage-restrictions-section').scrollIntoViewIfNeeded();
      await page.getByTestId('environment-restriction-select').click();
      await page.getByTestId('environment-production').click();
      await page.getByTestId('rate-limit-enabled').check();
      await page.getByTestId('rate-limit-requests').fill('1000');
      await page.getByTestId('rate-limit-period').fill('3600');
      
      // Save credential
      await page.getByTestId('save-credential-button').click();
      await expect(page.getByTestId('credential-saved-success')).toBeVisible();
      
      // Add Google Cloud credentials
      await page.getByTestId('add-credential-button').click();
      await page.getByTestId('credential-name-input').fill('Google Cloud Vertex AI');
      await page.getByTestId('credential-category-select').click();
      await page.getByTestId('category-cloud-services').click();
      
      await page.getByTestId('credential-description-textarea').fill('Service account credentials for Google Cloud Vertex AI integration');
      
      // Upload service account key file
      await page.getByTestId('credential-file-upload').click();
      const fileInput = page.getByTestId('file-upload-input');
      await fileInput.setInputFiles({
        name: 'vertex-ai-service-account.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{"type": "service_account", "project_id": "cortex-dc-web-dev", "private_key_id": "abc123"}')
      });
      
      await expect(page.getByTestId('file-uploaded-success')).toBeVisible();
      
      // Add additional fields
      await page.getByTestId('add-credential-field-button').click();
      await page.getByTestId('field-name-0').fill('Project ID');
      await page.getByTestId('field-type-0').click();
      await page.getByTestId('field-type-text').click();
      await page.getByTestId('field-value-0').fill('cortex-dc-web-dev');
      
      await page.getByTestId('add-credential-field-button').click();
      await page.getByTestId('field-name-1').fill('Location');
      await page.getByTestId('field-type-1').click();
      await page.getByTestId('field-type-text').click();
      await page.getByTestId('field-value-1').fill('us-central1');
      
      await page.getByTestId('save-credential-button').click();
      await expect(page.getByTestId('credential-saved-success')).toBeVisible();
      
      // Verify credentials appear in vault
      await expect(page.getByTestId('credential-slack-api')).toBeVisible();
      await expect(page.getByTestId('credential-gcp-vertex')).toBeVisible();
      
      console.log('✅ API credentials stored securely');
    });

    test('Credential access control and audit logging', async ({ page }) => {
      // Access vault and view audit logs
      await page.getByTestId('security-settings-tab').click();
      await page.getByTestId('credential-management-section').click();
      await page.getByTestId('unlock-vault-button').click();
      await page.getByTestId('master-password-input').fill('SecureVaultPassword2024!');
      await page.getByTestId('unlock-vault-submit').click();

      // Test credential access with different user roles
      await page.getByTestId('credential-slack-api').click();
      await expect(page.getByTestId('credential-details-modal')).toBeVisible();
      
      // View credential metadata (without secrets)
      await expect(page.getByTestId('credential-name-display')).toContainText('Slack API Integration');
      await expect(page.getByTestId('credential-category-display')).toContainText('API Keys');
      await expect(page.getByTestId('credential-created-date')).toBeVisible();
      await expect(page.getByTestId('credential-last-accessed')).toBeVisible();
      
      // Request access to secret fields
      await page.getByTestId('request-secret-access-button').click();
      await expect(page.getByTestId('secret-access-form')).toBeVisible();
      
      await page.getByTestId('access-reason-textarea').fill('Configuring Slack integration for production deployment');
      await page.getByTestId('access-duration-select').click();
      await page.getByTestId('duration-1-hour').click();
      
      await page.getByTestId('submit-access-request').click();
      
      // Admin auto-approval for this test
      await expect(page.getByTestId('access-request-approved')).toBeVisible();
      await expect(page.getByTestId('secrets-revealed')).toBeVisible();
      
      // Verify secret fields are now visible
      await expect(page.getByTestId('bot-token-field')).toBeVisible();
      await expect(page.getByTestId('app-token-field')).toBeVisible();
      await expect(page.getByTestId('signing-secret-field')).toBeVisible();
      
      // Copy credential securely
      await page.getByTestId('copy-bot-token-button').click();
      await expect(page.getByTestId('token-copied-notification')).toBeVisible();
      
      // View access audit log
      await page.getByTestId('audit-log-tab').click();
      await expect(page.getByTestId('credential-audit-log')).toBeVisible();
      
      // Verify audit entries
      await expect(page.getByTestId('audit-entry-vault-unlock')).toBeVisible();
      await expect(page.getByTestId('audit-entry-credential-access')).toBeVisible();
      await expect(page.getByTestId('audit-entry-secret-revealed')).toBeVisible();
      await expect(page.getByTestId('audit-entry-token-copied')).toBeVisible();
      
      // Check audit entry details
      const auditEntry = page.getByTestId('audit-entry-secret-revealed');
      await auditEntry.click();
      
      await expect(page.getByTestId('audit-details-modal')).toBeVisible();
      await expect(page.getByTestId('audit-action')).toContainText('Secret Access Granted');
      await expect(page.getByTestId('audit-user')).toContainText('admin1@dev.local');
      await expect(page.getByTestId('audit-timestamp')).toBeVisible();
      await expect(page.getByTestId('audit-reason')).toContainText('Configuring Slack integration');
      await expect(page.getByTestId('audit-ip-address')).toBeVisible();
      
      console.log('✅ Credential access control and auditing validated');
    });

    test('Credential rotation and lifecycle management', async ({ page }) => {
      // Access credential management
      await page.getByTestId('security-settings-tab').click();
      await page.getByTestId('credential-management-section').click();
      await page.getByTestId('unlock-vault-button').click();
      await page.getByTestId('master-password-input').fill('SecureVaultPassword2024!');
      await page.getByTestId('unlock-vault-submit').click();

      // Navigate to credential lifecycle management
      await page.getByTestId('credential-lifecycle-tab').click();
      await expect(page.getByTestId('lifecycle-dashboard')).toBeVisible();
      
      // View credential expiration status
      await expect(page.getByTestId('expiring-credentials-section')).toBeVisible();
      await expect(page.getByTestId('expired-credentials-section')).toBeVisible();
      await expect(page.getByTestId('rotation-schedule-section')).toBeVisible();
      
      // Set up automatic rotation for Slack API credentials
      await page.getByTestId('credential-slack-api-lifecycle').click();
      await expect(page.getByTestId('credential-rotation-config')).toBeVisible();
      
      await page.getByTestId('enable-auto-rotation').check();
      await page.getByTestId('rotation-frequency-select').click();
      await page.getByTestId('frequency-90-days').click();
      
      await page.getByTestId('rotation-advance-notice-days').fill('14');
      await page.getByTestId('rotation-notification-channels').click();
      await page.getByTestId('notify-email').check();
      await page.getByTestId('notify-slack').check();
      
      // Configure rotation webhook
      await page.getByTestId('rotation-webhook-section').scrollIntoViewIfNeeded();
      await page.getByTestId('webhook-url-input').fill('https://hooks.slack.com/services/rotation-webhook');
      await page.getByTestId('webhook-secret-input').fill('rotation-webhook-secret-key');
      
      await page.getByTestId('save-rotation-config').click();
      await expect(page.getByTestId('rotation-config-saved')).toBeVisible();
      
      // Manual credential rotation test
      await page.getByTestId('test-rotation-button').click();
      await expect(page.getByTestId('rotation-confirmation-dialog')).toBeVisible();
      
      await page.getByTestId('rotation-reason-textarea').fill('Manual rotation test for credential management validation');
      await page.getByTestId('confirm-rotation-button').click();
      
      // Monitor rotation process
      await expect(page.getByTestId('rotation-in-progress')).toBeVisible();
      await expect(page.getByTestId('rotation-progress-bar')).toBeVisible();
      
      // Rotation steps verification
      await expect(page.getByTestId('rotation-step-backup-old')).toContainText('✓ Old credential backed up');
      await expect(page.getByTestId('rotation-step-generate-new')).toContainText('✓ New credential generated');
      await expect(page.getByTestId('rotation-step-update-integrations')).toContainText('✓ Integrations updated');
      await expect(page.getByTestId('rotation-step-verify-functionality')).toContainText('✓ Functionality verified');
      
      await expect(page.getByTestId('rotation-completed-success')).toBeVisible({ timeout: 45000 });
      
      // Verify new credential version
      await page.getByTestId('view-credential-history-button').click();
      await expect(page.getByTestId('credential-version-history')).toBeVisible();
      await expect(page.getByTestId('current-version-indicator')).toBeVisible();
      await expect(page.getByTestId('previous-version-backup')).toBeVisible();
      
      console.log('✅ Credential rotation and lifecycle management validated');
    });

    test('Integration credential usage and monitoring', async ({ page }) => {
      // Navigate to credential usage monitoring
      await page.getByTestId('security-settings-tab').click();
      await page.getByTestId('credential-monitoring-section').click();
      await expect(page.getByTestId('credential-usage-dashboard')).toBeVisible();

      // View real-time usage metrics
      await expect(page.getByTestId('active-credential-sessions')).toBeVisible();
      await expect(page.getByTestId('api-calls-last-24h')).toBeVisible();
      await expect(page.getByTestId('credential-usage-trends')).toBeVisible();
      
      // Slack integration usage monitoring
      await page.getByTestId('slack-credentials-usage').click();
      await expect(page.getByTestId('slack-usage-details')).toBeVisible();
      
      await expect(page.getByTestId('bot-api-calls-count')).toBeVisible();
      await expect(page.getByTestId('webhook-deliveries-count')).toBeVisible();
      await expect(page.getByTestId('rate-limit-status')).toBeVisible();
      await expect(page.getByTestId('error-rate-metric')).toBeVisible();
      
      // Configure usage alerts
      await page.getByTestId('configure-usage-alerts-button').click();
      await expect(page.getByTestId('usage-alerts-config')).toBeVisible();
      
      // High usage alert
      await page.getByTestId('add-alert-rule-button').click();
      await page.getByTestId('alert-name-0').fill('High API Usage Alert');
      await page.getByTestId('alert-metric-0').click();
      await page.getByTestId('metric-api-calls-per-hour').click();
      await page.getByTestId('alert-threshold-0').fill('500');
      await page.getByTestId('alert-condition-0').click();
      await page.getByTestId('condition-greater-than').click();
      
      // Rate limit warning alert
      await page.getByTestId('add-alert-rule-button').click();
      await page.getByTestId('alert-name-1').fill('Rate Limit Warning');
      await page.getByTestId('alert-metric-1').click();
      await page.getByTestId('metric-rate-limit-utilization').click();
      await page.getByTestId('alert-threshold-1').fill('80');
      await page.getByTestId('alert-condition-1').click();
      await page.getByTestId('condition-greater-than').click();
      
      // Failed requests alert
      await page.getByTestId('add-alert-rule-button').click();
      await page.getByTestId('alert-name-2').fill('Failed Requests Alert');
      await page.getByTestId('alert-metric-2').click();
      await page.getByTestId('metric-error-rate').click();
      await page.getByTestId('alert-threshold-2').fill('5');
      await page.getByTestId('alert-condition-2').click();
      await page.getByTestId('condition-greater-than').click();
      
      await page.getByTestId('save-usage-alerts').click();
      await expect(page.getByTestId('usage-alerts-configured')).toBeVisible();
      
      // Test credential health check
      await page.getByTestId('run-health-check-button').click();
      await expect(page.getByTestId('health-check-progress')).toBeVisible();
      
      await expect(page.getByTestId('health-check-results')).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId('slack-credentials-health')).toContainText('Healthy');
      await expect(page.getByTestId('gcp-credentials-health')).toContainText('Healthy');
      await expect(page.getByTestId('overall-system-health')).toContainText('All systems operational');
      
      // Generate usage report
      await page.getByTestId('generate-usage-report-button').click();
      await expect(page.getByTestId('report-generation-dialog')).toBeVisible();
      
      await page.getByTestId('report-period-select').click();
      await page.getByTestId('period-last-30-days').click();
      
      await page.getByTestId('include-usage-metrics').check();
      await page.getByTestId('include-security-events').check();
      await page.getByTestId('include-performance-data').check();
      
      await page.getByTestId('generate-report-submit').click();
      await expect(page.getByTestId('report-generation-progress')).toBeVisible();
      
      await expect(page.getByTestId('usage-report-ready')).toBeVisible({ timeout: 30000 });
      await page.getByTestId('download-usage-report-button').click();
      await expect(page.getByTestId('report-download-success')).toBeVisible();
      
      console.log('✅ Credential usage monitoring and reporting validated');
    });
  });
});