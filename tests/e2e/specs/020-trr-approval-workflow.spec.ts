import { test, expect } from '@playwright/test';
import { signIn, signOut, seedTestProject, seedTestPOV } from '../utils/auth-helpers';

test.describe('TRR (Technical Risk Review) - Approval Workflow', () => {
  
  test.describe('TRR Creation and Submission', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'user1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Complete TRR creation with risk assessment', async ({ page }) => {
      // Navigate to TRR creation
      await page.getByTestId('create-trr-button').click();
      await expect(page.getByTestId('trr-creation-dialog')).toBeVisible();

      // Basic TRR Information
      await page.getByTestId('trr-title-input').fill('Security Risk Assessment - Zero Trust Implementation');
      await page.getByTestId('trr-description-textarea').fill('Comprehensive risk assessment for the Zero Trust architecture deployment at Acme Corp');
      
      // Select related project and POV
      await page.getByTestId('trr-project-select').click();
      await page.getByTestId('project-option-first').click();
      
      await page.getByTestId('trr-pov-select').click();
      await page.getByTestId('pov-option-first').click();
      
      await page.getByTestId('trr-priority-select').click();
      await page.getByTestId('priority-option-high').click();

      // Risk Assessment Section
      await page.getByTestId('overall-risk-score').fill('7.5');
      
      // Add risk categories
      await page.getByTestId('add-risk-category-button').click();
      await page.getByTestId('risk-category-name-0').fill('Network Security');
      await page.getByTestId('risk-category-score-0').fill('8');
      await page.getByTestId('risk-category-description-0').fill('High risk due to legacy network infrastructure and limited segmentation capabilities');
      await page.getByTestId('risk-category-mitigation-0').fill('Implement network segmentation with VLAN isolation and micro-segmentation');

      await page.getByTestId('add-risk-category-button').click();
      await page.getByTestId('risk-category-name-1').fill('Identity Management');
      await page.getByTestId('risk-category-score-1').fill('6');
      await page.getByTestId('risk-category-description-1').fill('Medium risk due to inconsistent MFA deployment and privileged access management');
      await page.getByTestId('risk-category-mitigation-1').fill('Deploy comprehensive MFA and PAM solution with conditional access policies');

      await page.getByTestId('add-risk-category-button').click();
      await page.getByTestId('risk-category-name-2').fill('Endpoint Security');
      await page.getByTestId('risk-category-score-2').fill('9');
      await page.getByTestId('risk-category-description-2').fill('Critical risk from unmanaged devices and insufficient endpoint protection');
      await page.getByTestId('risk-category-mitigation-2').fill('Deploy comprehensive EDR solution with device compliance enforcement');

      // Add findings
      await page.getByTestId('add-finding-button').click();
      await page.getByTestId('finding-title-0').fill('Unencrypted Network Traffic');
      await page.getByTestId('finding-description-0').fill('Internal network traffic is transmitted without encryption, exposing sensitive data to interception');
      await page.getByTestId('finding-severity-0').click();
      await page.getByTestId('severity-option-high').click();
      await page.getByTestId('finding-category-0').fill('Network Security');
      await page.getByTestId('finding-recommendation-0').fill('Implement TLS encryption for all internal communications and deploy network encryption protocols');

      await page.getByTestId('add-finding-button').click();
      await page.getByTestId('finding-title-1').fill('Weak Password Policies');
      await page.getByTestId('finding-description-1').fill('Current password policies do not meet security standards with insufficient complexity requirements');
      await page.getByTestId('finding-severity-1').click();
      await page.getByTestId('severity-option-medium').click();
      await page.getByTestId('finding-category-1').fill('Identity Management');
      await page.getByTestId('finding-recommendation-1').fill('Implement strong password policies with minimum 12 characters and complexity requirements');

      await page.getByTestId('add-finding-button').click();
      await page.getByTestId('finding-title-2').fill('Unmanaged Device Access');
      await page.getByTestId('finding-description-2').fill('Unauthorized devices can access corporate network resources without proper validation');
      await page.getByTestId('finding-severity-2').click();
      await page.getByTestId('severity-option-critical').click();
      await page.getByTestId('finding-category-2').fill('Endpoint Security');
      await page.getByTestId('finding-recommendation-2').fill('Implement device compliance policies and network access control (NAC) solution');

      // Submit TRR
      await page.getByTestId('create-trr-button').click();

      // Verify TRR creation success
      await expect(page.getByTestId('trr-creation-success')).toBeVisible();
      await expect(page.getByTestId('success-message')).toContainText('TRR created successfully');
      
      const trrId = await page.getByTestId('created-trr-id').textContent();
      expect(trrId).toBeTruthy();

      // Verify TRR appears with draft status
      await page.getByTestId('close-success-dialog').click();
      await expect(page.getByTestId(`trr-card-${trrId}`)).toBeVisible();
      await expect(page.getByTestId(`trr-status-${trrId}`)).toContainText('Draft');
      await expect(page.getByTestId(`trr-overall-score-${trrId}`)).toContainText('7.5');
      await expect(page.getByTestId(`trr-findings-count-${trrId}`)).toContainText('3 findings');

      console.log('✅ TRR creation with risk assessment validated');
    });

    test('TRR submission for review workflow', async ({ page }) => {
      // First create a TRR (simplified)
      await page.getByTestId('create-trr-button').click();
      await page.getByTestId('trr-title-input').fill('Test TRR for Submission');
      await page.getByTestId('trr-description-textarea').fill('TRR ready for manager review');
      await page.getByTestId('trr-project-select').click();
      await page.getByTestId('project-option-first').click();
      await page.getByTestId('overall-risk-score').fill('6');
      
      // Add minimal risk assessment
      await page.getByTestId('add-risk-category-button').click();
      await page.getByTestId('risk-category-name-0').fill('General Risk');
      await page.getByTestId('risk-category-score-0').fill('6');
      await page.getByTestId('risk-category-description-0').fill('Standard risk assessment');

      await page.getByTestId('create-trr-button').click();
      await page.getByTestId('close-success-dialog').click();

      // Get TRR ID from created card
      const trrCard = page.getByTestId('trr-card').first();
      await expect(trrCard).toBeVisible();
      
      // Open TRR details
      await trrCard.click();
      await expect(page.getByTestId('trr-details-dialog')).toBeVisible();

      // Submit for review
      await page.getByTestId('submit-for-review-button').click();
      await expect(page.getByTestId('submit-confirmation-dialog')).toBeVisible();
      
      // Add submission notes
      await page.getByTestId('submission-notes').fill('TRR completed and ready for management review. All risk categories assessed and mitigation strategies defined.');
      await page.getByTestId('confirm-submit-button').click();

      // Verify status change
      await expect(page.getByTestId('trr-status-badge')).toContainText('In Review');
      await expect(page.getByTestId('submission-success-message')).toContainText('TRR submitted for review');
      
      // Verify submission is logged in activity timeline
      await expect(page.getByTestId('activity-timeline')).toContainText('Submitted for review');
      await expect(page.getByTestId('activity-timeline')).toContainText('user1@dev.local');

      console.log('✅ TRR submission workflow validated');
    });
  });

  test.describe('TRR Manager Approval Process', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'manager1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Manager reviews and approves TRR', async ({ page }) => {
      // Navigate to pending TRR reviews
      await page.getByTestId('pending-reviews-tab').click();
      await expect(page.getByTestId('pending-trr-list')).toBeVisible();

      // Select first pending TRR
      const pendingTRR = page.getByTestId('pending-trr-card').first();
      await expect(pendingTRR).toBeVisible();
      await pendingTRR.click();

      // Verify TRR details for review
      await expect(page.getByTestId('trr-review-dialog')).toBeVisible();
      await expect(page.getByTestId('trr-status-badge')).toContainText('In Review');
      
      // Review risk assessment
      await expect(page.getByTestId('risk-categories-section')).toBeVisible();
      await expect(page.getByTestId('findings-section')).toBeVisible();
      await expect(page.getByTestId('overall-risk-score')).toBeVisible();

      // Manager review process
      await page.getByTestId('manager-review-section').scrollIntoViewIfNeeded();
      
      // Add review comments for each risk category
      await page.getByTestId('review-comment-risk-category-0').fill('Network security assessment is thorough and mitigation strategies are appropriate');
      await page.getByTestId('review-comment-risk-category-1').fill('Identity management risks properly identified, recommend prioritizing MFA deployment');
      await page.getByTestId('review-comment-risk-category-2').fill('Endpoint security is critical priority, approve immediate EDR deployment');

      // Review findings
      await page.getByTestId('review-finding-0').click();
      await page.getByTestId('finding-approval-status-0').click();
      await page.getByTestId('finding-status-approved').click();
      await page.getByTestId('finding-review-comment-0').fill('Critical finding, encryption implementation approved');

      await page.getByTestId('review-finding-1').click();
      await page.getByTestId('finding-approval-status-1').click();
      await page.getByTestId('finding-status-approved').click();
      await page.getByTestId('finding-review-comment-1').fill('Password policy update approved, implement within 30 days');

      await page.getByTestId('review-finding-2').click();
      await page.getByTestId('finding-approval-status-2').click();
      await page.getByTestId('finding-status-approved').click();
      await page.getByTestId('finding-review-comment-2').fill('High priority finding, NAC solution approved for immediate deployment');

      // Overall manager review
      await page.getByTestId('overall-review-decision').click();
      await page.getByTestId('decision-option-approved').click();
      
      await page.getByTestId('manager-review-comments').fill('TRR is comprehensive and well-documented. All findings are valid and mitigation strategies are appropriate. Approved for implementation with high priority on endpoint security measures.');
      
      // Set implementation timeline
      await page.getByTestId('implementation-timeline').fill('90 days');
      await page.getByTestId('budget-approval').fill('250000');

      // Approve TRR
      await page.getByTestId('approve-trr-button').click();
      await expect(page.getByTestId('approval-confirmation-dialog')).toBeVisible();
      await page.getByTestId('digital-signature-input').fill('M. Rodriguez - DC Manager');
      await page.getByTestId('confirm-approval-button').click();

      // Verify approval success
      await expect(page.getByTestId('approval-success-message')).toContainText('TRR approved successfully');
      await expect(page.getByTestId('trr-status-badge')).toContainText('Approved');
      
      // Verify approval details
      await expect(page.getByTestId('approval-details')).toContainText('Approved by: manager1@dev.local');
      await expect(page.getByTestId('approval-timestamp')).toBeVisible();
      await expect(page.getByTestId('digital-signature')).toContainText('M. Rodriguez - DC Manager');

      // Verify activity timeline updated
      await expect(page.getByTestId('activity-timeline')).toContainText('TRR approved by manager');
      
      console.log('✅ Manager TRR approval process validated');
    });

    test('Manager requests TRR modifications', async ({ page }) => {
      // Navigate to pending reviews
      await page.getByTestId('pending-reviews-tab').click();
      const pendingTRR = page.getByTestId('pending-trr-card').first();
      await pendingTRR.click();

      // Request modifications instead of approving
      await page.getByTestId('overall-review-decision').click();
      await page.getByTestId('decision-option-modifications-required').click();
      
      // Specify required modifications
      await page.getByTestId('modification-requests').fill(`Required modifications:
1. Network security risk score should be increased to 9 given the legacy infrastructure
2. Add additional finding for lack of network monitoring capabilities
3. Include specific timeline for each mitigation strategy
4. Add budget estimates for each risk category
5. Include compliance requirements (SOC2, ISO27001) in assessment`);

      await page.getByTestId('modification-priority').click();
      await page.getByTestId('priority-option-high').click();
      
      await page.getByTestId('modification-deadline').fill('7 days');

      // Submit modification request
      await page.getByTestId('request-modifications-button').click();
      await expect(page.getByTestId('modification-confirmation-dialog')).toBeVisible();
      await page.getByTestId('confirm-modification-request-button').click();

      // Verify status change
      await expect(page.getByTestId('trr-status-badge')).toContainText('Modifications Required');
      await expect(page.getByTestId('modification-success-message')).toContainText('Modification request sent');
      
      // Verify notification was created for original author
      await expect(page.getByTestId('activity-timeline')).toContainText('Modifications requested by manager');
      await expect(page.getByTestId('modification-details')).toContainText('7 days');

      console.log('✅ Manager modification request workflow validated');
    });
  });

  test.describe('TRR Admin Final Review', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'admin1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Admin performs final validation and digital signoff', async ({ page }) => {
      // Navigate to admin TRR dashboard
      await page.getByTestId('admin-dashboard-tab').click();
      await page.getByTestId('approved-trrs-section').click();
      
      // Select approved TRR requiring final validation
      const approvedTRR = page.getByTestId('approved-trr-card').first();
      await expect(approvedTRR).toBeVisible();
      await expect(approvedTRR.getByTestId('trr-status')).toContainText('Approved');
      await approvedTRR.click();

      // Admin final validation process
      await expect(page.getByTestId('admin-validation-section')).toBeVisible();
      
      // Review manager's approval and comments
      await expect(page.getByTestId('manager-approval-summary')).toBeVisible();
      await expect(page.getByTestId('manager-comments')).toContainText('Approved for implementation');
      
      // Admin compliance check
      await page.getByTestId('compliance-checklist').scrollIntoViewIfNeeded();
      await page.getByTestId('compliance-soc2').check();
      await page.getByTestId('compliance-iso27001').check();
      await page.getByTestId('compliance-nist').check();
      await page.getByTestId('compliance-gdpr').check();
      
      // Risk tolerance validation
      await page.getByTestId('risk-tolerance-validation').click();
      await page.getByTestId('risk-tolerance-acceptable').click();
      
      // Business impact assessment
      await page.getByTestId('business-impact-assessment').fill(`Business Impact Assessment:
- Financial: Estimated $2.5M risk mitigation value
- Operational: Minimal disruption during 90-day implementation
- Compliance: Addresses SOC2 and ISO27001 requirements
- Strategic: Aligns with Zero Trust initiative objectives`);

      // Resource allocation validation
      await page.getByTestId('resource-allocation-approved').check();
      await page.getByTestId('budget-validation-approved').check();
      await page.getByTestId('timeline-validation-approved').check();

      // Admin validation decision
      await page.getByTestId('admin-validation-decision').click();
      await page.getByTestId('validation-decision-validated').click();
      
      await page.getByTestId('admin-validation-notes').fill('TRR has been thoroughly reviewed and validated. All compliance requirements met. Risk assessment is comprehensive and mitigation strategies are well-defined. Implementation timeline and budget are realistic. Final approval granted.');

      // Digital signoff
      await page.getByTestId('final-signoff-button').click();
      await expect(page.getByTestId('digital-signoff-dialog')).toBeVisible();
      
      await page.getByTestId('signoff-confirmation-text').fill('I hereby provide final digital signoff for this Technical Risk Review');
      await page.getByTestId('admin-digital-signature').fill('A. Smith - Chief Security Officer');
      await page.getByTestId('signoff-timestamp').click(); // Auto-populated
      
      // Generate compliance documentation
      await page.getByTestId('generate-compliance-docs').check();
      await page.getByTestId('retention-period').fill('7 years');

      // Complete final signoff
      await page.getByTestId('complete-signoff-button').click();

      // Verify final completion
      await expect(page.getByTestId('signoff-success-message')).toContainText('TRR signoff completed');
      await expect(page.getByTestId('trr-status-badge')).toContainText('Completed');
      
      // Verify compliance documentation generated
      await expect(page.getByTestId('compliance-doc-generated')).toContainText('Compliance documentation generated');
      await expect(page.getByTestId('audit-trail-complete')).toBeVisible();
      
      // Verify final details
      await expect(page.getByTestId('final-signoff-details')).toContainText('A. Smith - Chief Security Officer');
      await expect(page.getByTestId('completion-timestamp')).toBeVisible();
      await expect(page.getByTestId('retention-info')).toContainText('7 years');

      // Verify activity timeline shows complete workflow
      const timeline = page.getByTestId('activity-timeline');
      await expect(timeline).toContainText('Created by user1@dev.local');
      await expect(timeline).toContainText('Submitted for review');
      await expect(timeline).toContainText('Approved by manager1@dev.local');
      await expect(timeline).toContainText('Final validation by admin1@dev.local');
      await expect(timeline).toContainText('Digital signoff completed');

      console.log('✅ Admin final validation and digital signoff validated');
    });

    test('Admin rejects TRR and requests comprehensive review', async ({ page }) => {
      // Navigate to admin dashboard
      await page.getByTestId('admin-dashboard-tab').click();
      await page.getByTestId('approved-trrs-section').click();
      
      const approvedTRR = page.getByTestId('approved-trr-card').first();
      await approvedTRR.click();

      // Admin rejection process
      await page.getByTestId('admin-validation-decision').click();
      await page.getByTestId('validation-decision-rejected').click();
      
      // Specify rejection reasons
      await page.getByTestId('rejection-reasons').fill(`TRR Rejection - Comprehensive Review Required:

1. Risk Assessment Gaps:
   - Missing analysis of supply chain security risks
   - Insufficient cloud security risk evaluation
   - No consideration of insider threat scenarios

2. Compliance Deficiencies:
   - SOC2 Type II requirements not fully addressed
   - GDPR data protection impact assessment missing
   - Industry-specific compliance requirements (PCI-DSS) not evaluated

3. Technical Inadequacies:
   - Network architecture diagrams insufficient
   - No penetration testing results included
   - Missing vulnerability assessment data

4. Business Impact Analysis:
   - Cost-benefit analysis incomplete
   - No consideration of business continuity impact
   - Risk tolerance alignment not demonstrated`);

      await page.getByTestId('rejection-priority').click();
      await page.getByTestId('priority-option-critical').click();
      
      await page.getByTestId('revision-deadline').fill('14 days');
      
      // Assign back to original team with requirements
      await page.getByTestId('assign-back-to-team').check();
      await page.getByTestId('require-manager-re-review').check();
      await page.getByTestId('require-additional-validation').check();

      // Submit rejection
      await page.getByTestId('reject-trr-button').click();
      await expect(page.getByTestId('rejection-confirmation-dialog')).toBeVisible();
      await page.getByTestId('confirm-rejection-button').click();

      // Verify rejection processing
      await expect(page.getByTestId('rejection-success-message')).toContainText('TRR rejected and returned for revision');
      await expect(page.getByTestId('trr-status-badge')).toContainText('Rejected');
      
      // Verify notification details
      await expect(page.getByTestId('rejection-details')).toContainText('14 days');
      await expect(page.getByTestId('rejection-priority')).toContainText('Critical');
      
      // Verify activity timeline
      await expect(page.getByTestId('activity-timeline')).toContainText('Rejected by admin');
      await expect(page.getByTestId('activity-timeline')).toContainText('Comprehensive review required');

      console.log('✅ Admin TRR rejection workflow validated');
    });
  });

  test.describe('TRR End-to-End Multi-User Workflow', () => {
    test('Complete TRR lifecycle with multiple users', async ({ browser }) => {
      // Test the complete flow across user roles using multiple browser contexts
      const userContext = await browser.newContext();
      const managerContext = await browser.newContext(); 
      const adminContext = await browser.newContext();

      const userPage = await userContext.newPage();
      const managerPage = await managerContext.newPage();
      const adminPage = await adminContext.newPage();

      try {
        // Step 1: User creates and submits TRR
        await userPage.goto('/');
        await signIn(userPage, 'user1@dev.local', 'Password123!');
        
        await userPage.getByTestId('create-trr-button').click();
        await userPage.getByTestId('trr-title-input').fill('End-to-End Test TRR');
        await userPage.getByTestId('trr-description-textarea').fill('Complete workflow test');
        await userPage.getByTestId('trr-project-select').click();
        await userPage.getByTestId('project-option-first').click();
        await userPage.getByTestId('overall-risk-score').fill('7');
        
        await userPage.getByTestId('add-risk-category-button').click();
        await userPage.getByTestId('risk-category-name-0').fill('Test Category');
        await userPage.getByTestId('risk-category-score-0').fill('7');
        await userPage.getByTestId('risk-category-description-0').fill('Test description');
        
        await userPage.getByTestId('create-trr-button').click();
        await userPage.getByTestId('close-success-dialog').click();
        
        // Submit for review
        const trrCard = userPage.getByTestId('trr-card').first();
        await trrCard.click();
        await userPage.getByTestId('submit-for-review-button').click();
        await userPage.getByTestId('submission-notes').fill('Ready for review');
        await userPage.getByTestId('confirm-submit-button').click();
        
        // Step 2: Manager reviews and approves
        await managerPage.goto('/');
        await signIn(managerPage, 'manager1@dev.local', 'Password123!');
        
        await managerPage.getByTestId('pending-reviews-tab').click();
        const pendingTRR = managerPage.getByTestId('pending-trr-card').first();
        await pendingTRR.click();
        
        await managerPage.getByTestId('overall-review-decision').click();
        await managerPage.getByTestId('decision-option-approved').click();
        await managerPage.getByTestId('manager-review-comments').fill('Approved by manager');
        await managerPage.getByTestId('approve-trr-button').click();
        await managerPage.getByTestId('digital-signature-input').fill('Manager Approval');
        await managerPage.getByTestId('confirm-approval-button').click();
        
        // Step 3: Admin validates and provides final signoff
        await adminPage.goto('/');
        await signIn(adminPage, 'admin1@dev.local', 'Password123!');
        
        await adminPage.getByTestId('admin-dashboard-tab').click();
        await adminPage.getByTestId('approved-trrs-section').click();
        const approvedTRR = adminPage.getByTestId('approved-trr-card').first();
        await approvedTRR.click();
        
        await adminPage.getByTestId('admin-validation-decision').click();
        await adminPage.getByTestId('validation-decision-validated').click();
        await adminPage.getByTestId('admin-validation-notes').fill('Final validation complete');
        await adminPage.getByTestId('final-signoff-button').click();
        await adminPage.getByTestId('signoff-confirmation-text').fill('Final signoff confirmation');
        await adminPage.getByTestId('admin-digital-signature').fill('Admin Final Approval');
        await adminPage.getByTestId('complete-signoff-button').click();
        
        // Verify final state
        await expect(adminPage.getByTestId('trr-status-badge')).toContainText('Completed');
        await expect(adminPage.getByTestId('signoff-success-message')).toContainText('TRR signoff completed');
        
        // Verify user can see completed TRR
        await userPage.reload();
        const completedCard = userPage.getByTestId('trr-card').first();
        await expect(completedCard.getByTestId('trr-status')).toContainText('Completed');
        
        console.log('✅ Complete multi-user TRR workflow validated');
        
      } finally {
        await userContext.close();
        await managerContext.close();
        await adminContext.close();
      }
    });
  });
});