import { test, expect } from '@playwright/test';
import { signIn, signOut } from '../utils/auth-helpers';

test.describe('PANW Document Mapping - Feature Enhancement Tests', () => {
  
  test.describe('Design of Record (DOR) Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'user1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Create POV with DOR template mapping', async ({ page }) => {
      // Navigate to POV creation with DOR integration
      await page.getByTestId('create-pov-button').click();
      await expect(page.getByTestId('pov-creation-wizard')).toBeVisible();

      // Check for DOR template selection
      await page.getByTestId('document-template-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('dor-template-option')).toBeVisible();
      await page.getByTestId('dor-template-option').click();

      // Fill basic POV information with DOR context
      await page.getByTestId('pov-title-input').fill('Zero Trust Architecture - DOR Integration');
      await page.getByTestId('pov-description-textarea').fill('POV implementing Design of Record for Zero Trust with PANW SASE solution');
      
      // DOR-specific fields
      await expect(page.getByTestId('dor-architecture-section')).toBeVisible();
      await page.getByTestId('dor-architecture-type').click();
      await page.getByTestId('architecture-option-sase').click();
      
      await page.getByTestId('dor-deployment-model').click();
      await page.getByTestId('deployment-option-cloud-first').click();
      
      // Map DOR components
      await page.getByTestId('add-dor-component-button').click();
      await page.getByTestId('dor-component-name-0').fill('Prisma Access');
      await page.getByTestId('dor-component-type-0').click();
      await page.getByTestId('component-type-sase').click();
      await page.getByTestId('dor-component-description-0').fill('Cloud-delivered security platform for Zero Trust network access');

      await page.getByTestId('add-dor-component-button').click();
      await page.getByTestId('dor-component-name-1').fill('Cortex XDR');
      await page.getByTestId('dor-component-type-1').click();
      await page.getByTestId('component-type-endpoint-protection').click();
      await page.getByTestId('dor-component-description-1').fill('AI-driven endpoint detection and response platform');

      // DOR validation requirements
      await page.getByTestId('dor-validation-section').scrollIntoViewIfNeeded();
      await page.getByTestId('dor-validation-criteria').fill('Validate 99.9% uptime, <100ms latency, and zero-day threat protection');
      await page.getByTestId('dor-success-metrics').fill('Reduce security incidents by 90%, improve user experience by 50%');
      
      // Proceed to next step
      await page.getByTestId('next-step-button').click();
      
      // Verify DOR template data persists
      await expect(page.getByTestId('objectives-step')).toBeVisible();
      await expect(page.getByTestId('dor-summary-section')).toContainText('Prisma Access');
      await expect(page.getByTestId('dor-summary-section')).toContainText('Cortex XDR');

      console.log('✅ DOR template integration validated');
    });

    test('DOR document generation and export', async ({ page }) => {
      // Navigate to existing POV with DOR template
      await page.getByTestId('pov-list-section').scrollIntoViewIfNeeded();
      const dorPOV = page.getByTestId('pov-card').filter({ hasText: 'DOR Integration' }).first();
      await dorPOV.click();

      // Open document generation section
      await page.getByTestId('document-generation-tab').click();
      await expect(page.getByTestId('dor-generation-section')).toBeVisible();

      // Configure DOR document parameters
      await page.getByTestId('dor-template-version').click();
      await page.getByTestId('template-version-latest').click();
      
      await page.getByTestId('dor-output-format').click();
      await page.getByTestId('format-option-pdf').click();
      
      await page.getByTestId('include-architecture-diagrams').check();
      await page.getByTestId('include-component-specifications').check();
      await page.getByTestId('include-validation-criteria').check();

      // Generate DOR document
      await page.getByTestId('generate-dor-document-button').click();
      await expect(page.getByTestId('generation-progress-indicator')).toBeVisible();
      
      // Wait for generation completion
      await expect(page.getByTestId('generation-success-message')).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId('generated-document-link')).toBeVisible();
      
      // Verify document metadata
      await expect(page.getByTestId('document-metadata')).toContainText('Design of Record');
      await expect(page.getByTestId('document-metadata')).toContainText('PDF');
      await expect(page.getByTestId('document-timestamp')).toBeVisible();

      console.log('✅ DOR document generation validated');
    });
  });

  test.describe('Solution Design Workbook (SDW) Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'manager1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Create comprehensive SDW from POV data', async ({ page }) => {
      // Navigate to SDW creation
      await page.getByTestId('solution-design-workbook-tab').click();
      await page.getByTestId('create-sdw-button').click();
      await expect(page.getByTestId('sdw-creation-wizard')).toBeVisible();

      // Link to existing POV
      await page.getByTestId('source-pov-select').click();
      await page.getByTestId('pov-option-first').click();
      
      // SDW basic information
      await page.getByTestId('sdw-title-input').fill('Enterprise Zero Trust Solution Design');
      await page.getByTestId('sdw-version-input').fill('v2.1');
      await page.getByTestId('sdw-customer-input').fill('Acme Corporation');

      // Solution requirements section
      await page.getByTestId('solution-requirements-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-requirement-button').click();
      await page.getByTestId('requirement-category-0').click();
      await page.getByTestId('category-option-security').click();
      await page.getByTestId('requirement-title-0').fill('Zero Trust Network Access');
      await page.getByTestId('requirement-description-0').fill('Implement comprehensive ZTNA solution with identity-based access controls');
      await page.getByTestId('requirement-priority-0').click();
      await page.getByTestId('priority-option-critical').click();

      await page.getByTestId('add-requirement-button').click();
      await page.getByTestId('requirement-category-1').click();
      await page.getByTestId('category-option-performance').click();
      await page.getByTestId('requirement-title-1').fill('Network Performance Optimization');
      await page.getByTestId('requirement-description-1').fill('Maintain <100ms latency for critical applications');
      await page.getByTestId('requirement-priority-1').click();
      await page.getByTestId('priority-option-high').click();

      // Technical architecture section
      await page.getByTestId('technical-architecture-section').scrollIntoViewIfNeeded();
      await page.getByTestId('architecture-diagram-upload').click();
      
      // Simulate file upload
      const fileInput = page.getByTestId('file-input-hidden');
      await fileInput.setInputFiles({
        name: 'zero-trust-architecture.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data')
      });
      
      await expect(page.getByTestId('uploaded-diagram-preview')).toBeVisible();
      
      // Add architecture components
      await page.getByTestId('add-architecture-component-button').click();
      await page.getByTestId('component-name-0').fill('Prisma Access Gateway');
      await page.getByTestId('component-function-0').fill('Secure web gateway and cloud access security broker');
      await page.getByTestId('component-specifications-0').fill('100Gbps throughput, 99.9% availability, multi-region deployment');

      // Implementation phases
      await page.getByTestId('implementation-phases-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-phase-button').click();
      await page.getByTestId('phase-name-0').fill('Phase 1: Foundation Setup');
      await page.getByTestId('phase-duration-0').fill('6 weeks');
      await page.getByTestId('phase-deliverables-0').fill('Infrastructure deployment, initial configuration, user onboarding');
      await page.getByTestId('phase-success-criteria-0').fill('95% of users migrated, all critical applications accessible');

      // Create SDW
      await page.getByTestId('create-sdw-button').click();
      await expect(page.getByTestId('sdw-creation-success')).toBeVisible();
      
      // Verify SDW appears in list
      const sdwId = await page.getByTestId('created-sdw-id').textContent();
      await page.getByTestId('close-success-dialog').click();
      await expect(page.getByTestId(`sdw-card-${sdwId}`)).toBeVisible();
      await expect(page.getByTestId(`sdw-status-${sdwId}`)).toContainText('Draft');

      console.log('✅ Solution Design Workbook creation validated');
    });

    test('SDW collaboration and version control', async ({ page }) => {
      // Open existing SDW
      const sdwCard = page.getByTestId('sdw-card').first();
      await sdwCard.click();
      await expect(page.getByTestId('sdw-details-view')).toBeVisible();

      // Enable collaboration
      await page.getByTestId('collaboration-tab').click();
      await page.getByTestId('enable-collaboration-button').click();
      
      // Add collaborators
      await page.getByTestId('add-collaborator-button').click();
      await page.getByTestId('collaborator-email-input').fill('engineer1@company.com');
      await page.getByTestId('collaborator-role-select').click();
      await page.getByTestId('role-option-editor').click();
      await page.getByTestId('add-collaborator-submit').click();
      
      await expect(page.getByTestId('collaborator-list')).toContainText('engineer1@company.com');
      
      // Create new version
      await page.getByTestId('version-control-tab').click();
      await page.getByTestId('create-version-button').click();
      await page.getByTestId('version-notes-input').fill('Updated architecture diagrams and implementation timeline');
      await page.getByTestId('version-type-select').click();
      await page.getByTestId('version-type-minor').click();
      await page.getByTestId('create-version-submit').click();
      
      // Verify version created
      await expect(page.getByTestId('version-history')).toContainText('v2.2');
      await expect(page.getByTestId('version-history')).toContainText('Updated architecture diagrams');

      console.log('✅ SDW collaboration and versioning validated');
    });
  });

  test.describe('Bad Ass Blueprint (BAB) Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'admin1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Generate BAB from completed POV and SDW', async ({ page }) => {
      // Navigate to BAB generation
      await page.getByTestId('bad-ass-blueprint-tab').click();
      await page.getByTestId('generate-bab-button').click();
      await expect(page.getByTestId('bab-generation-wizard')).toBeVisible();

      // Select source documents
      await page.getByTestId('source-pov-select').click();
      await page.getByTestId('pov-option-completed').first().click();
      
      await page.getByTestId('source-sdw-select').click();
      await page.getByTestId('sdw-option-approved').first().click();
      
      // BAB configuration
      await page.getByTestId('bab-blueprint-type').click();
      await page.getByTestId('blueprint-type-enterprise').click();
      
      await page.getByTestId('bab-complexity-level').click();
      await page.getByTestId('complexity-level-advanced').click();
      
      // Executive summary configuration
      await page.getByTestId('executive-summary-section').scrollIntoViewIfNeeded();
      await page.getByTestId('include-roi-analysis').check();
      await page.getByTestId('include-risk-assessment').check();
      await page.getByTestId('include-competitive-analysis').check();
      
      // Technical deep-dive sections
      await page.getByTestId('technical-sections-config').scrollIntoViewIfNeeded();
      await page.getByTestId('include-network-topology').check();
      await page.getByTestId('include-security-policies').check();
      await page.getByTestId('include-deployment-automation').check();
      await page.getByTestId('include-monitoring-strategy').check();
      
      // Custom sections
      await page.getByTestId('add-custom-section-button').click();
      await page.getByTestId('custom-section-title-0').fill('PANW Portfolio Integration');
      await page.getByTestId('custom-section-content-0').fill('Comprehensive integration strategy for Prisma, Cortex, and Strata product suites');
      
      await page.getByTestId('add-custom-section-button').click();
      await page.getByTestId('custom-section-title-1').fill('Customer Success Metrics');
      await page.getByTestId('custom-section-content-1').fill('KPIs and success criteria specific to customer business objectives');

      // BAB branding and styling
      await page.getByTestId('branding-section').scrollIntoViewIfNeeded();
      await page.getByTestId('customer-logo-upload').click();
      
      const logoInput = page.getByTestId('logo-file-input');
      await logoInput.setInputFiles({
        name: 'customer-logo.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-logo-data')
      });
      
      await page.getByTestId('color-scheme-select').click();
      await page.getByTestId('color-scheme-professional').click();
      
      // Generate BAB
      await page.getByTestId('generate-bab-submit').click();
      await expect(page.getByTestId('bab-generation-progress')).toBeVisible();
      
      // Wait for generation (this might take longer)
      await expect(page.getByTestId('bab-generation-complete')).toBeVisible({ timeout: 60000 });
      await expect(page.getByTestId('generated-bab-preview')).toBeVisible();
      
      // Verify BAB content sections
      await expect(page.getByTestId('bab-executive-summary')).toBeVisible();
      await expect(page.getByTestId('bab-technical-architecture')).toBeVisible();
      await expect(page.getByTestId('bab-implementation-roadmap')).toBeVisible();
      await expect(page.getByTestId('bab-portfolio-integration')).toBeVisible();

      console.log('✅ Bad Ass Blueprint generation validated');
    });

    test('BAB customization and finalization', async ({ page }) => {
      // Open existing BAB draft
      const babCard = page.getByTestId('bab-draft-card').first();
      await babCard.click();
      await expect(page.getByTestId('bab-editor-view')).toBeVisible();

      // Customize BAB content
      await page.getByTestId('edit-executive-summary-button').click();
      await page.getByTestId('executive-summary-editor').fill(`
Executive Summary - Enhanced Version

This Bad Ass Blueprint presents a comprehensive Zero Trust architecture implementation leveraging the complete PANW portfolio. The solution addresses critical security gaps while maintaining operational excellence and user experience.

Key Benefits:
• 90% reduction in security incidents
• 50% improvement in user experience
• 99.9% network availability
• ROI of 340% over 3 years
      `);
      await page.getByTestId('save-section-button').click();
      
      // Add implementation timeline
      await page.getByTestId('implementation-timeline-section').scrollIntoViewIfNeeded();
      await page.getByTestId('edit-timeline-button').click();
      
      await page.getByTestId('add-milestone-button').click();
      await page.getByTestId('milestone-title-0').fill('Phase 1: Foundation (Weeks 1-6)');
      await page.getByTestId('milestone-deliverables-0').fill('Prisma Access deployment, initial user migration, policy configuration');
      
      await page.getByTestId('add-milestone-button').click();
      await page.getByTestId('milestone-title-1').fill('Phase 2: Expansion (Weeks 7-12)');
      await page.getByTestId('milestone-deliverables-1').fill('Cortex XDR integration, advanced threat protection, monitoring setup');
      
      await page.getByTestId('save-timeline-button').click();
      
      // BAB quality review
      await page.getByTestId('quality-review-tab').click();
      await page.getByTestId('run-quality-check-button').click();
      
      await expect(page.getByTestId('quality-check-results')).toBeVisible();
      await expect(page.getByTestId('technical-accuracy-score')).toBeVisible();
      await expect(page.getByTestId('completeness-score')).toBeVisible();
      await expect(page.getByTestId('presentation-quality-score')).toBeVisible();
      
      // Address any quality issues
      const issues = page.getByTestId('quality-issues-list');
      const issueCount = await issues.count();
      
      if (issueCount > 0) {
        await page.getByTestId('resolve-issue-0').click();
        await page.getByTestId('issue-resolution-text').fill('Updated technical specifications for accuracy');
        await page.getByTestId('mark-resolved-button').click();
      }
      
      // Finalize BAB
      await page.getByTestId('finalize-bab-button').click();
      await expect(page.getByTestId('finalization-confirmation-dialog')).toBeVisible();
      await page.getByTestId('final-review-checklist-1').check();
      await page.getByTestId('final-review-checklist-2').check();
      await page.getByTestId('final-review-checklist-3').check();
      await page.getByTestId('confirm-finalization-button').click();
      
      // Verify finalization
      await expect(page.getByTestId('bab-status-badge')).toContainText('Finalized');
      await expect(page.getByTestId('finalization-timestamp')).toBeVisible();

      console.log('✅ BAB customization and finalization validated');
    });

    test('Multi-document integration workflow', async ({ page }) => {
      // Navigate to integrated document workflow
      await page.getByTestId('document-workflow-tab').click();
      await expect(page.getByTestId('workflow-dashboard')).toBeVisible();

      // Create integrated workflow
      await page.getByTestId('create-workflow-button').click();
      await page.getByTestId('workflow-name-input').fill('Enterprise Zero Trust Complete Package');
      await page.getByTestId('workflow-description-input').fill('Complete document suite: POV → SDW → BAB integration');

      // Add workflow steps
      await page.getByTestId('add-workflow-step-button').click();
      await page.getByTestId('step-type-0').click();
      await page.getByTestId('step-type-pov').click();
      await page.getByTestId('step-template-0').click();
      await page.getByTestId('template-dor').click();

      await page.getByTestId('add-workflow-step-button').click();
      await page.getByTestId('step-type-1').click();
      await page.getByTestId('step-type-sdw').click();
      await page.getByTestId('step-dependency-1').click();
      await page.getByTestId('dependency-previous-step').click();

      await page.getByTestId('add-workflow-step-button').click();
      await page.getByTestId('step-type-2').click();
      await page.getByTestId('step-type-bab').click();
      await page.getByTestId('step-dependency-2').click();
      await page.getByTestId('dependency-all-previous').click();

      // Configure data flow between documents
      await page.getByTestId('data-flow-section').scrollIntoViewIfNeeded();
      await page.getByTestId('enable-auto-data-flow').check();
      await page.getByTestId('map-pov-to-sdw-fields').check();
      await page.getByTestId('map-sdw-to-bab-content').check();
      await page.getByTestId('maintain-version-consistency').check();

      // Set approval gates
      await page.getByTestId('approval-gates-section').scrollIntoViewIfNeeded();
      await page.getByTestId('require-manager-approval-pov').check();
      await page.getByTestId('require-technical-review-sdw').check();
      await page.getByTestId('require-executive-approval-bab').check();

      // Create and validate workflow
      await page.getByTestId('create-workflow-submit').click();
      await expect(page.getByTestId('workflow-creation-success')).toBeVisible();
      
      const workflowId = await page.getByTestId('created-workflow-id').textContent();
      await page.getByTestId('close-success-dialog').click();
      
      // Verify workflow appears in dashboard
      await expect(page.getByTestId(`workflow-card-${workflowId}`)).toBeVisible();
      await expect(page.getByTestId(`workflow-steps-count-${workflowId}`)).toContainText('3 steps');
      await expect(page.getByTestId(`workflow-status-${workflowId}`)).toContainText('Ready');

      console.log('✅ Multi-document integration workflow validated');
    });
  });
});