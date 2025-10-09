import { test, expect } from '@playwright/test';
import { signIn, signOut, seedTestProject } from '../utils/auth-helpers';

test.describe('POV Creation Wizard - Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Sign in as a regular user for POV creation
    await signIn(page, 'user1@dev.local', 'Password123!');
    await page.waitForTimeout(2000); // Allow auth to settle
  });

  test.afterEach(async ({ page }) => {
    await signOut(page);
  });

  test('Complete POV wizard workflow with all steps', async ({ page }) => {
    // Step 1: Navigate to POV creation
    await page.getByTestId('create-pov-button').click();
    await expect(page.getByTestId('pov-wizard-dialog')).toBeVisible();
    
    // Verify wizard header and steps
    await expect(page.getByTestId('wizard-title')).toContainText('Create Proof of Value');
    await expect(page.getByTestId('wizard-steps')).toBeVisible();
    
    // Step 2: Basic Information (Step 1/5)
    await expect(page.getByTestId('wizard-step-basic')).toHaveClass(/active/);
    
    // Fill basic information
    await page.getByTestId('pov-title-input').fill('Zero Trust Implementation - Acme Corp');
    await page.getByTestId('pov-description-textarea').fill('Comprehensive Zero Trust architecture implementation for enhanced security posture');
    
    // Select priority
    await page.getByTestId('pov-priority-select').click();
    await page.getByTestId('priority-option-high').click();
    
    // Select project (assuming seeded project exists)
    await page.getByTestId('pov-project-select').click();
    await page.getByTestId('project-option-first').click();
    
    // Continue to next step
    await page.getByTestId('wizard-next-button').click();
    
    // Step 3: Success Objectives (Step 2/5)
    await expect(page.getByTestId('wizard-step-objectives')).toHaveClass(/active/);
    
    // Add first objective
    await page.getByTestId('add-objective-button').click();
    await page.getByTestId('objective-description-0').fill('Implement network segmentation with 99% uptime');
    await page.getByTestId('objective-success-criteria-0').fill('Network segmentation deployed across all critical systems with zero unplanned downtime');
    await page.getByTestId('objective-weight-0').fill('40');
    
    // Add second objective  
    await page.getByTestId('add-objective-button').click();
    await page.getByTestId('objective-description-1').fill('Deploy identity verification system');
    await page.getByTestId('objective-success-criteria-1').fill('Multi-factor authentication implemented for 100% of users with <2 second login time');
    await page.getByTestId('objective-weight-1').fill('35');
    
    // Add third objective
    await page.getByTestId('add-objective-button').click(); 
    await page.getByTestId('objective-description-2').fill('Enable endpoint protection across all devices');
    await page.getByTestId('objective-success-criteria-2').fill('Endpoint detection and response deployed on 100% of managed devices');
    await page.getByTestId('objective-weight-2').fill('25');
    
    // Verify total weight validation (should be 100%)
    await expect(page.getByTestId('objectives-total-weight')).toContainText('100%');
    
    await page.getByTestId('wizard-next-button').click();
    
    // Step 4: Execution Phases (Step 3/5)
    await expect(page.getByTestId('wizard-step-phases')).toHaveClass(/active/);
    
    // Verify default phases are loaded
    await expect(page.getByTestId('phase-card')).toHaveCount(4); // Default phases: Planning, Implementation, Testing, Validation
    
    // Customize first phase
    await page.getByTestId('phase-edit-0').click();
    await page.getByTestId('phase-name-0').fill('Planning & Architecture');
    await page.getByTestId('phase-description-0').fill('Initial planning, architecture design, and stakeholder alignment');
    
    // Add tasks to first phase
    await page.getByTestId('add-phase-task-0').click();
    await page.getByTestId('phase-task-0-0').fill('Conduct stakeholder interviews');
    await page.getByTestId('add-phase-task-0').click();
    await page.getByTestId('phase-task-0-1').fill('Design network architecture');
    await page.getByTestId('add-phase-task-0').click();
    await page.getByTestId('phase-task-0-2').fill('Create implementation timeline');
    
    // Set phase dates
    await page.getByTestId('phase-start-date-0').click();
    await page.getByRole('gridcell', { name: '1' }).first().click(); // Select 1st of current month
    
    await page.getByTestId('phase-end-date-0').click();
    await page.getByRole('gridcell', { name: '15' }).first().click(); // Select 15th
    
    await page.getByTestId('wizard-next-button').click();
    
    // Step 5: Test Plan (Step 4/5)
    await expect(page.getByTestId('wizard-step-test-plan')).toHaveClass(/active/);
    
    // Set test environment
    await page.getByTestId('test-environment-input').fill('Customer Lab Environment - Isolated Network');
    
    // Set timeline
    await page.getByTestId('test-start-date').click();
    await page.getByRole('gridcell', { name: '20' }).first().click(); // Start on 20th
    
    await page.getByTestId('test-end-date').click(); 
    await page.getByRole('gridcell', { name: '30' }).first().click(); // End on 30th
    
    // Add resources
    await page.getByTestId('add-resource-button').click();
    await page.getByTestId('resource-type-0').click();
    await page.getByTestId('resource-type-personnel').click();
    await page.getByTestId('resource-description-0').fill('Senior Security Engineer');
    await page.getByTestId('resource-quantity-0').fill('1');
    
    await page.getByTestId('add-resource-button').click();
    await page.getByTestId('resource-type-1').click();
    await page.getByTestId('resource-type-equipment').click();
    await page.getByTestId('resource-description-1').fill('Dedicated test servers');
    await page.getByTestId('resource-quantity-1').fill('3');
    await page.getByTestId('resource-cost-1').fill('5000');
    
    // Add team members
    await page.getByTestId('add-team-member-button').click();
    await page.getByTestId('team-member-0').fill('sarah.chen@company.com');
    await page.getByTestId('add-team-member-button').click();
    await page.getByTestId('team-member-1').fill('marcus.rodriguez@company.com');
    
    await page.getByTestId('wizard-next-button').click();
    
    // Step 6: Review & Submit (Step 5/5)
    await expect(page.getByTestId('wizard-step-review')).toHaveClass(/active/);
    
    // Verify all information is displayed in review
    await expect(page.getByTestId('review-title')).toContainText('Zero Trust Implementation - Acme Corp');
    await expect(page.getByTestId('review-priority')).toContainText('High');
    await expect(page.getByTestId('review-objectives')).toContainText('3 objectives');
    await expect(page.getByTestId('review-phases')).toContainText('4 phases');
    await expect(page.getByTestId('review-resources')).toContainText('2 resources');
    await expect(page.getByTestId('review-team')).toContainText('2 team members');
    
    // Verify objectives summary
    await expect(page.getByTestId('review-objective-0')).toContainText('network segmentation');
    await expect(page.getByTestId('review-objective-1')).toContainText('identity verification');
    await expect(page.getByTestId('review-objective-2')).toContainText('endpoint protection');
    
    // Submit POV
    await page.getByTestId('wizard-submit-button').click();
    
    // Verify submission success
    await expect(page.getByTestId('pov-creation-success')).toBeVisible();
    await expect(page.getByTestId('success-message')).toContainText('POV created successfully');
    await expect(page.getByTestId('created-pov-id')).toBeVisible();
    
    // Extract POV ID for verification
    const povId = await page.getByTestId('created-pov-id').textContent();
    expect(povId).toBeTruthy();
    
    // Close success dialog
    await page.getByTestId('close-success-dialog').click();
    
    // Verify POV appears in dashboard
    await expect(page.getByTestId(`pov-card-${povId}`)).toBeVisible();
    await expect(page.getByTestId(`pov-title-${povId}`)).toContainText('Zero Trust Implementation - Acme Corp');
    await expect(page.getByTestId(`pov-status-${povId}`)).toContainText('Planning');
    
    console.log('✅ Complete POV wizard workflow validated');
  });

  test('POV wizard form validation and error handling', async ({ page }) => {
    await page.getByTestId('create-pov-button').click();
    
    // Try to proceed without filling required fields
    await page.getByTestId('wizard-next-button').click();
    
    // Verify validation errors
    await expect(page.getByTestId('title-error')).toContainText('Title is required');
    await expect(page.getByTestId('description-error')).toContainText('Description is required');
    await expect(page.getByTestId('project-error')).toContainText('Project selection is required');
    
    // Fill minimum required fields
    await page.getByTestId('pov-title-input').fill('Test POV');
    await page.getByTestId('pov-description-textarea').fill('Test description');
    await page.getByTestId('pov-project-select').click();
    await page.getByTestId('project-option-first').click();
    
    // Now should be able to proceed
    await page.getByTestId('wizard-next-button').click();
    await expect(page.getByTestId('wizard-step-objectives')).toHaveClass(/active/);
    
    // Try to proceed without objectives
    await page.getByTestId('wizard-next-button').click();
    await expect(page.getByTestId('objectives-error')).toContainText('At least one objective is required');
    
    // Add objective with invalid weight
    await page.getByTestId('add-objective-button').click();
    await page.getByTestId('objective-description-0').fill('Test objective');
    await page.getByTestId('objective-success-criteria-0').fill('Test criteria');
    await page.getByTestId('objective-weight-0').fill('150'); // Invalid: > 100
    
    await expect(page.getByTestId('weight-error-0')).toContainText('Weight must be between 0 and 100');
    
    // Fix weight
    await page.getByTestId('objective-weight-0').fill('100');
    
    // Should now be able to proceed
    await page.getByTestId('wizard-next-button').click();
    await expect(page.getByTestId('wizard-step-phases')).toHaveClass(/active/);
    
    console.log('✅ POV wizard form validation tested');
  });

  test('POV wizard navigation and persistence', async ({ page }) => {
    await page.getByTestId('create-pov-button').click();
    
    // Fill first step
    await page.getByTestId('pov-title-input').fill('Navigation Test POV');
    await page.getByTestId('pov-description-textarea').fill('Testing navigation persistence');
    await page.getByTestId('pov-project-select').click();
    await page.getByTestId('project-option-first').click();
    
    // Go to step 2
    await page.getByTestId('wizard-next-button').click();
    
    // Add objective
    await page.getByTestId('add-objective-button').click();
    await page.getByTestId('objective-description-0').fill('Test navigation objective');
    await page.getByTestId('objective-success-criteria-0').fill('Navigation works correctly');
    await page.getByTestId('objective-weight-0').fill('100');
    
    // Navigate back to step 1
    await page.getByTestId('wizard-previous-button').click();
    
    // Verify data persistence
    await expect(page.getByTestId('pov-title-input')).toHaveValue('Navigation Test POV');
    await expect(page.getByTestId('pov-description-textarea')).toHaveValue('Testing navigation persistence');
    
    // Navigate forward again
    await page.getByTestId('wizard-next-button').click();
    
    // Verify objective data persisted
    await expect(page.getByTestId('objective-description-0')).toHaveValue('Test navigation objective');
    await expect(page.getByTestId('objective-success-criteria-0')).toHaveValue('Navigation works correctly');
    await expect(page.getByTestId('objective-weight-0')).toHaveValue('100');
    
    // Test step navigation via step indicators
    await page.getByTestId('wizard-step-indicator-phases').click();
    await expect(page.getByTestId('wizard-step-phases')).toHaveClass(/active/);
    
    // Navigate back via step indicator
    await page.getByTestId('wizard-step-indicator-basic').click();
    await expect(page.getByTestId('wizard-step-basic')).toHaveClass(/active/);
    
    // Data should still be persisted
    await expect(page.getByTestId('pov-title-input')).toHaveValue('Navigation Test POV');
    
    console.log('✅ POV wizard navigation and persistence validated');
  });

  test('POV wizard cancel and data cleanup', async ({ page }) => {
    await page.getByTestId('create-pov-button').click();
    
    // Fill some data
    await page.getByTestId('pov-title-input').fill('Test Cancel POV');
    await page.getByTestId('pov-description-textarea').fill('This should be cancelled');
    
    // Cancel wizard
    await page.getByTestId('wizard-cancel-button').click();
    
    // Verify confirmation dialog
    await expect(page.getByTestId('cancel-confirmation-dialog')).toBeVisible();
    await expect(page.getByTestId('cancel-warning')).toContainText('lose any unsaved changes');
    
    // Confirm cancellation
    await page.getByTestId('confirm-cancel-button').click();
    
    // Verify wizard is closed
    await expect(page.getByTestId('pov-wizard-dialog')).not.toBeVisible();
    
    // Open wizard again and verify clean state
    await page.getByTestId('create-pov-button').click();
    await expect(page.getByTestId('pov-title-input')).toHaveValue('');
    await expect(page.getByTestId('pov-description-textarea')).toHaveValue('');
    
    console.log('✅ POV wizard cancellation and cleanup validated');
  });
});