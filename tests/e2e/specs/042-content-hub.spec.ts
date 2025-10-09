import { test, expect } from '@playwright/test';
import { signIn, signOut } from '../utils/auth-helpers';

test.describe('Content Hub - Feature Enhancement Tests', () => {
  
  test.describe('Demo Library Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'manager1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Create and organize demo content library', async ({ page }) => {
      // Navigate to Content Hub
      await page.getByTestId('content-hub-tab').click();
      await page.getByTestId('demo-library-section').click();
      await expect(page.getByTestId('demo-library-dashboard')).toBeVisible();

      // Create new demo content
      await page.getByTestId('create-demo-content-button').click();
      await expect(page.getByTestId('demo-creation-wizard')).toBeVisible();
      
      // Basic demo information
      await page.getByTestId('demo-title-input').fill('Prisma Access Zero Trust Demo');
      await page.getByTestId('demo-description-textarea').fill('Comprehensive demonstration of Prisma Access capabilities for Zero Trust network access implementation');
      
      // Demo classification and tagging
      await page.getByTestId('demo-category-select').click();
      await page.getByTestId('category-sase').click();
      
      await page.getByTestId('demo-product-family-select').click();
      await page.getByTestId('product-family-prisma').click();
      
      await page.getByTestId('demo-solution-area-select').click();
      await page.getByTestId('solution-area-network-security').click();
      
      // Add demo tags
      await page.getByTestId('demo-tags-input').fill('zero-trust, sase, remote-work, cloud-security');
      await page.getByTestId('add-tags-button').click();
      
      // Demo audience and use case
      await page.getByTestId('target-audience-section').scrollIntoViewIfNeeded();
      await page.getByTestId('audience-ciso').check();
      await page.getByTestId('audience-it-director').check();
      await page.getByTestId('audience-network-admin').check();
      
      await page.getByTestId('use-case-evaluation').check();
      await page.getByTestId('use-case-poc').check();
      await page.getByTestId('use-case-customer-presentation').check();
      
      // Demo content and assets
      await page.getByTestId('demo-content-section').scrollIntoViewIfNeeded();
      
      // Upload demo video
      const videoInput = page.getByTestId('demo-video-upload');
      await videoInput.setInputFiles({
        name: 'prisma-access-demo.mp4',
        mimeType: 'video/mp4',
        buffer: Buffer.from('fake-demo-video-data')
      });
      
      // Upload presentation slides
      const slidesInput = page.getByTestId('demo-slides-upload');
      await slidesInput.setInputFiles({
        name: 'prisma-access-slides.pptx',
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        buffer: Buffer.from('fake-slides-data')
      });
      
      // Upload demo script
      const scriptInput = page.getByTestId('demo-script-upload');
      await scriptInput.setInputFiles({
        name: 'demo-script.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake-script-data')
      });
      
      // Demo configuration and setup
      await page.getByTestId('demo-setup-section').scrollIntoViewIfNeeded();
      await page.getByTestId('setup-time-minutes').fill('15');
      await page.getByTestId('demo-duration-minutes').fill('45');
      await page.getByTestId('technical-requirements-text').fill(`
Technical Requirements:
• Prisma Access tenant with GlobalProtect licenses
• Demo user accounts (minimum 5)
• Test applications (SaaS and private apps)
• Network connectivity for remote access simulation
• Admin access to Prisma Access console
      `);
      
      // Prerequisites and preparation
      await page.getByTestId('prerequisites-text').fill(`
Prerequisites:
• Basic understanding of Zero Trust concepts
• Familiarity with network security principles
• Access to customer network topology information
• Understanding of current remote access challenges
      `);
      
      // Demo flow and key talking points
      await page.getByTestId('demo-flow-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-demo-step-button').click();
      await page.getByTestId('step-title-0').fill('Introduction and Business Case');
      await page.getByTestId('step-duration-0').fill('5');
      await page.getByTestId('step-description-0').fill('Present Zero Trust framework and business drivers for secure remote access');
      await page.getByTestId('step-talking-points-0').fill('• Remote work security challenges\n• Traditional VPN limitations\n• Zero Trust principles and benefits');
      
      await page.getByTestId('add-demo-step-button').click();
      await page.getByTestId('step-title-1').fill('Prisma Access Architecture Overview');
      await page.getByTestId('step-duration-1').fill('10');
      await page.getByTestId('step-description-1').fill('Demonstrate cloud-delivered security architecture and deployment models');
      await page.getByTestId('step-talking-points-1').fill('• Cloud-native architecture\n• Global points of presence\n• Integrated security services');
      
      await page.getByTestId('add-demo-step-button').click();
      await page.getByTestId('step-title-2').fill('Live Demo - User Experience');
      await page.getByTestId('step-duration-2').fill('20');
      await page.getByTestId('step-description-2').fill('Show end-user experience with GlobalProtect and secure application access');
      await page.getByTestId('step-talking-points-2').fill('• Seamless user experience\n• Automatic security policy application\n• Application access optimization');
      
      await page.getByTestId('add-demo-step-button').click();
      await page.getByTestId('step-title-3').fill('Administrator Console and Policies');
      await page.getByTestId('step-duration-3').fill('10');
      await page.getByTestId('step-description-3').fill('Demonstrate policy configuration and management capabilities');
      await page.getByTestId('step-talking-points-3').fill('• Policy management interface\n• Real-time visibility and analytics\n• Automated threat response');
      
      // Success metrics and outcomes
      await page.getByTestId('success-metrics-section').scrollIntoViewIfNeeded();
      await page.getByTestId('demo-objectives-text').fill(`
Demo Success Objectives:
• Clearly articulate Zero Trust business value
• Demonstrate superior user experience vs VPN
• Show comprehensive security policy enforcement
• Illustrate administrative simplicity and efficiency
• Generate qualified leads for POV engagement
      `);
      
      // Create demo content
      await page.getByTestId('create-demo-button').click();
      await expect(page.getByTestId('demo-creation-success')).toBeVisible();
      
      const demoId = await page.getByTestId('created-demo-id').textContent();
      await page.getByTestId('close-success-dialog').click();
      
      // Verify demo appears in library
      await expect(page.getByTestId(`demo-card-${demoId}`)).toBeVisible();
      await expect(page.getByTestId(`demo-title-${demoId}`)).toContainText('Prisma Access Zero Trust Demo');
      await expect(page.getByTestId(`demo-category-${demoId}`)).toContainText('SASE');

      console.log('✅ Demo library content creation validated');
    });

    test('Demo content search, filtering, and categorization', async ({ page }) => {
      // Navigate to demo library
      await page.getByTestId('content-hub-tab').click();
      await page.getByTestId('demo-library-section').click();

      // Test search functionality
      await page.getByTestId('demo-search-input').fill('Zero Trust');
      await page.getByTestId('search-demos-button').click();
      
      await expect(page.getByTestId('search-results-count')).toBeVisible();
      await expect(page.getByTestId('demo-search-results')).toContainText('Prisma Access Zero Trust Demo');
      
      // Clear search and test filtering
      await page.getByTestId('clear-search-button').click();
      
      // Filter by product family
      await page.getByTestId('filter-product-family').click();
      await page.getByTestId('filter-prisma').check();
      await page.getByTestId('apply-filters-button').click();
      
      await expect(page.getByTestId('filtered-results')).toBeVisible();
      
      // Filter by solution area
      await page.getByTestId('filter-solution-area').click();
      await page.getByTestId('filter-network-security').check();
      await page.getByTestId('apply-filters-button').click();
      
      // Filter by target audience
      await page.getByTestId('filter-audience').click();
      await page.getByTestId('filter-ciso').check();
      await page.getByTestId('apply-filters-button').click();
      
      // Test sorting options
      await page.getByTestId('sort-demos-select').click();
      await page.getByTestId('sort-by-popularity').click();
      
      await page.getByTestId('sort-demos-select').click();
      await page.getByTestId('sort-by-date-created').click();
      
      await page.getByTestId('sort-demos-select').click();
      await page.getByTestId('sort-by-rating').click();
      
      // Test demo preview
      const demoCard = page.getByTestId('demo-card').first();
      await demoCard.click();
      
      await expect(page.getByTestId('demo-preview-modal')).toBeVisible();
      await expect(page.getByTestId('demo-details-tab')).toBeVisible();
      await expect(page.getByTestId('demo-assets-tab')).toBeVisible();
      await expect(page.getByTestId('demo-flow-tab')).toBeVisible();
      await expect(page.getByTestId('demo-feedback-tab')).toBeVisible();
      
      await page.getByTestId('close-preview-modal').click();

      console.log('✅ Demo search, filtering, and categorization validated');
    });

    test('Demo content usage analytics and feedback', async ({ page }) => {
      // Open existing demo
      await page.getByTestId('content-hub-tab').click();
      await page.getByTestId('demo-library-section').click();
      
      const demoCard = page.getByTestId('demo-card').first();
      await demoCard.click();
      
      // Navigate to usage analytics tab
      await page.getByTestId('demo-analytics-tab').click();
      await expect(page.getByTestId('demo-analytics-dashboard')).toBeVisible();
      
      // View usage metrics
      await expect(page.getByTestId('total-views-metric')).toBeVisible();
      await expect(page.getByTestId('total-downloads-metric')).toBeVisible();
      await expect(page.getByTestId('average-rating-metric')).toBeVisible();
      await expect(page.getByTestId('usage-trends-chart')).toBeVisible();
      
      // View user feedback
      await page.getByTestId('feedback-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('user-feedback-list')).toBeVisible();
      
      // Add feedback and rating
      await page.getByTestId('add-feedback-button').click();
      await expect(page.getByTestId('feedback-form')).toBeVisible();
      
      // Rate the demo
      await page.getByTestId('rating-5-stars').click();
      
      // Provide detailed feedback
      await page.getByTestId('feedback-text').fill(`
Excellent demo content for Zero Trust presentations. The flow is logical and the technical depth is appropriate for executive audiences. 

Strengths:
• Clear business value articulation
• Comprehensive technical demonstration
• Well-structured presentation flow
• Practical implementation guidance

Suggestions for improvement:
• Add more industry-specific use cases
• Include cost comparison with legacy VPN solutions
• Provide more detailed competitive differentiation
• Add customer testimonials and case studies
      `);
      
      // Categorize feedback
      await page.getByTestId('feedback-category-content-quality').check();
      await page.getByTestId('feedback-category-technical-accuracy').check();
      await page.getByTestId('feedback-category-presentation-flow').check();
      
      await page.getByTestId('submit-feedback-button').click();
      await expect(page.getByTestId('feedback-submitted-success')).toBeVisible();
      
      // View performance recommendations
      await page.getByTestId('performance-recommendations-tab').click();
      await expect(page.getByTestId('recommendations-panel')).toBeVisible();
      await expect(page.getByTestId('content-improvement-suggestions')).toBeVisible();
      await expect(page.getByTestId('usage-optimization-tips')).toBeVisible();

      console.log('✅ Demo analytics and feedback validated');
    });
  });

  test.describe('DC-Specific Field Requirements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await signIn(page, 'user1@dev.local', 'Password123!');
      await page.waitForTimeout(2000);
    });

    test.afterEach(async ({ page }) => {
      await signOut(page);
    });

    test('Configure DC-specific data collection fields', async ({ page }) => {
      // Navigate to DC field configuration
      await page.getByTestId('content-hub-tab').click();
      await page.getByTestId('dc-fields-configuration-tab').click();
      await expect(page.getByTestId('dc-fields-management')).toBeVisible();

      // Customer Information Fields
      await page.getByTestId('customer-info-section').scrollIntoViewIfNeeded();
      await page.getByTestId('configure-customer-fields-button').click();
      
      // Required customer fields
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-0').fill('Industry Vertical');
      await page.getByTestId('field-type-0').click();
      await page.getByTestId('field-type-select').click();
      await page.getByTestId('field-options-0').fill('Financial Services,Healthcare,Manufacturing,Retail,Government,Education,Technology');
      await page.getByTestId('field-required-0').check();
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-1').fill('Company Size');
      await page.getByTestId('field-type-1').click();
      await page.getByTestId('field-type-select').click();
      await page.getByTestId('field-options-1').fill('SMB (<500),Mid-Market (500-5000),Enterprise (5000+),Global Enterprise (50000+)');
      await page.getByTestId('field-required-1').check();
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-2').fill('Current Security Stack');
      await page.getByTestId('field-type-2').click();
      await page.getByTestId('field-type-multiselect').click();
      await page.getByTestId('field-options-2').fill('Palo Alto Networks,Cisco,Fortinet,Check Point,Zscaler,Okta,CrowdStrike,Microsoft,Other');
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-3').fill('Primary Security Challenges');
      await page.getByTestId('field-type-3').click();
      await page.getByTestId('field-type-multiselect').click();
      await page.getByTestId('field-options-3').fill('Remote Work Security,Cloud Migration,Zero Trust Implementation,Compliance,Threat Detection,Network Performance,Cost Optimization');
      await page.getByTestId('field-required-3').check();
      
      // Technical Environment Fields
      await page.getByTestId('technical-environment-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-4').fill('Cloud Infrastructure');
      await page.getByTestId('field-type-4').click();
      await page.getByTestId('field-type-multiselect').click();
      await page.getByTestId('field-options-4').fill('AWS,Microsoft Azure,Google Cloud,Hybrid Cloud,On-Premises Only,Multi-Cloud');
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-5').fill('Network Architecture');
      await page.getByTestId('field-type-5').click();
      await page.getByTestId('field-type-text').click();
      await page.getByTestId('field-placeholder-5').fill('Describe current network architecture and topology');
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-6').fill('Remote Users Count');
      await page.getByTestId('field-type-6').click();
      await page.getByTestId('field-type-number').click();
      await page.getByTestId('field-min-value-6').fill('0');
      await page.getByTestId('field-max-value-6').fill('100000');
      
      // Project and Engagement Fields
      await page.getByTestId('project-engagement-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-7').fill('Project Timeline');
      await page.getByTestId('field-type-7').click();
      await page.getByTestId('field-type-select').click();
      await page.getByTestId('field-options-7').fill('Immediate (0-30 days),Short-term (1-3 months),Medium-term (3-6 months),Long-term (6-12 months),Future (12+ months)');
      await page.getByTestId('field-required-7').check();
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-8').fill('Budget Range');
      await page.getByTestId('field-type-8').click();
      await page.getByTestId('field-type-select').click();
      await page.getByTestId('field-options-8').fill('Under $100K,$100K-$500K,$500K-$1M,$1M-$5M,$5M+,Not Determined');
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-9').fill('Key Stakeholders');
      await page.getByTestId('field-type-9').click();
      await page.getByTestId('field-type-multiselect').click();
      await page.getByTestId('field-options-9').fill('CISO,IT Director,Network Administrator,Security Engineer,Compliance Officer,Executive Leadership');
      
      // Compliance and Regulatory Fields
      await page.getByTestId('compliance-regulatory-section').scrollIntoViewIfNeeded();
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-10').fill('Regulatory Requirements');
      await page.getByTestId('field-type-10').click();
      await page.getByTestId('field-type-multiselect').click();
      await page.getByTestId('field-options-10').fill('SOX,HIPAA,PCI-DSS,SOC2,ISO27001,GDPR,CCPA,NIST,FedRAMP,FISMA');
      
      await page.getByTestId('add-field-button').click();
      await page.getByTestId('field-name-11').fill('Data Classification Requirements');
      await page.getByTestId('field-type-11').click();
      await page.getByTestId('field-type-textarea').click();
      await page.getByTestId('field-placeholder-11').fill('Describe data classification and protection requirements');
      
      // Save field configuration
      await page.getByTestId('save-field-configuration').click();
      await expect(page.getByTestId('field-config-saved-success')).toBeVisible();

      console.log('✅ DC-specific field configuration validated');
    });

    test('Collect DC-specific data during POV creation', async ({ page }) => {
      // Create new POV with DC-specific fields
      await page.getByTestId('create-pov-button').click();
      await expect(page.getByTestId('pov-creation-wizard')).toBeVisible();
      
      // Basic POV information
      await page.getByTestId('pov-title-input').fill('Enterprise Security Transformation POV');
      await page.getByTestId('pov-description-textarea').fill('POV for comprehensive security transformation including Zero Trust implementation');
      
      // DC-specific customer information
      await page.getByTestId('dc-fields-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('dc-customer-fields')).toBeVisible();
      
      await page.getByTestId('industry-vertical-select').click();
      await page.getByTestId('industry-financial-services').click();
      
      await page.getByTestId('company-size-select').click();
      await page.getByTestId('company-size-enterprise').click();
      
      await page.getByTestId('current-security-stack-multiselect').click();
      await page.getByTestId('security-stack-palo-alto').check();
      await page.getByTestId('security-stack-cisco').check();
      await page.getByTestId('security-stack-okta').check();
      await page.getByTestId('apply-security-stack-selection').click();
      
      await page.getByTestId('security-challenges-multiselect').click();
      await page.getByTestId('challenge-remote-work').check();
      await page.getByTestId('challenge-zero-trust').check();
      await page.getByTestId('challenge-compliance').check();
      await page.getByTestId('apply-challenges-selection').click();
      
      // Technical environment information
      await page.getByTestId('technical-environment-fields').scrollIntoViewIfNeeded();
      
      await page.getByTestId('cloud-infrastructure-multiselect').click();
      await page.getByTestId('cloud-aws').check();
      await page.getByTestId('cloud-azure').check();
      await page.getByTestId('cloud-hybrid').check();
      await page.getByTestId('apply-cloud-selection').click();
      
      await page.getByTestId('network-architecture-textarea').fill(`
Current network architecture includes:
• Multi-site MPLS network with central internet breakout
• Legacy VPN infrastructure for remote access
• Distributed data centers in US and Europe
• Hybrid cloud connectivity to AWS and Azure
• Limited network segmentation with VLAN-based isolation
      `);
      
      await page.getByTestId('remote-users-count-input').fill('2500');
      
      // Project and engagement details
      await page.getByTestId('project-engagement-fields').scrollIntoViewIfNeeded();
      
      await page.getByTestId('project-timeline-select').click();
      await page.getByTestId('timeline-medium-term').click();
      
      await page.getByTestId('budget-range-select').click();
      await page.getByTestId('budget-1m-5m').click();
      
      await page.getByTestId('key-stakeholders-multiselect').click();
      await page.getByTestId('stakeholder-ciso').check();
      await page.getByTestId('stakeholder-it-director').check();
      await page.getByTestId('stakeholder-network-admin').check();
      await page.getByTestId('apply-stakeholders-selection').click();
      
      // Compliance and regulatory requirements
      await page.getByTestId('compliance-regulatory-fields').scrollIntoViewIfNeeded();
      
      await page.getByTestId('regulatory-requirements-multiselect').click();
      await page.getByTestId('regulation-sox').check();
      await page.getByTestId('regulation-pci-dss').check();
      await page.getByTestId('regulation-soc2').check();
      await page.getByTestId('apply-regulations-selection').click();
      
      await page.getByTestId('data-classification-textarea').fill(`
Data classification requirements:
• Public: Marketing materials, public documentation
• Internal: Employee data, internal communications
• Confidential: Customer data, financial information
• Restricted: Payment card data, personally identifiable information (PII)

Protection requirements include encryption at rest and in transit, access logging, and data loss prevention controls.
      `);
      
      // Continue with POV creation
      await page.getByTestId('next-step-button').click();
      
      // Verify DC fields data persists
      await expect(page.getByTestId('objectives-step')).toBeVisible();
      await page.getByTestId('previous-step-button').click();
      
      // Verify all fields maintained their values
      await expect(page.getByTestId('industry-vertical-select')).toContainText('Financial Services');
      await expect(page.getByTestId('company-size-select')).toContainText('Enterprise');
      await expect(page.getByTestId('remote-users-count-input')).toHaveValue('2500');

      console.log('✅ DC-specific data collection validated');
    });

    test('Generate DC insights and reporting from collected data', async ({ page }) => {
      // Navigate to DC analytics dashboard
      await page.getByTestId('content-hub-tab').click();
      await page.getByTestId('dc-analytics-tab').click();
      await expect(page.getByTestId('dc-analytics-dashboard')).toBeVisible();

      // View customer segmentation analytics
      await page.getByTestId('customer-segmentation-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('industry-distribution-chart')).toBeVisible();
      await expect(page.getByTestId('company-size-distribution-chart')).toBeVisible();
      await expect(page.getByTestId('geographic-distribution-map')).toBeVisible();
      
      // View technology landscape analytics
      await page.getByTestId('technology-landscape-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('security-stack-analysis')).toBeVisible();
      await expect(page.getByTestId('cloud-adoption-trends')).toBeVisible();
      await expect(page.getByTestId('architecture-patterns')).toBeVisible();
      
      // View engagement analytics
      await page.getByTestId('engagement-analytics-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('project-timeline-distribution')).toBeVisible();
      await expect(page.getByTestId('budget-range-analysis')).toBeVisible();
      await expect(page.getByTestId('stakeholder-engagement-patterns')).toBeVisible();
      
      // Generate DC insights report
      await page.getByTestId('generate-dc-insights-button').click();
      await expect(page.getByTestId('insights-generation-dialog')).toBeVisible();
      
      // Configure report parameters
      await page.getByTestId('report-time-period').click();
      await page.getByTestId('period-last-quarter').click();
      
      await page.getByTestId('include-customer-segmentation').check();
      await page.getByTestId('include-technology-trends').check();
      await page.getByTestId('include-engagement-patterns').check();
      await page.getByTestId('include-competitive-analysis').check();
      await page.getByTestId('include-recommendations').check();
      
      await page.getByTestId('report-format-select').click();
      await page.getByTestId('format-executive-summary').click();
      
      await page.getByTestId('generate-insights-report-submit').click();
      await expect(page.getByTestId('report-generation-progress')).toBeVisible();
      
      // Wait for report generation
      await expect(page.getByTestId('dc-insights-report-ready')).toBeVisible({ timeout: 45000 });
      await page.getByTestId('view-insights-report-button').click();
      
      // Validate report sections
      await expect(page.getByTestId('executive-summary-section')).toBeVisible();
      await expect(page.getByTestId('customer-insights-section')).toBeVisible();
      await expect(page.getByTestId('technology-trends-section')).toBeVisible();
      await expect(page.getByTestId('engagement-recommendations-section')).toBeVisible();
      
      // Export report
      await page.getByTestId('export-report-button').click();
      await page.getByTestId('export-format-pdf').click();
      await expect(page.getByTestId('report-export-success')).toBeVisible();

      console.log('✅ DC insights and reporting validated');
    });

    test('Validate DC data quality and field completion', async ({ page }) => {
      // Navigate to data quality dashboard
      await page.getByTestId('content-hub-tab').click();
      await page.getByTestId('data-quality-tab').click();
      await expect(page.getByTestId('data-quality-dashboard')).toBeVisible();

      // View field completion rates
      await expect(page.getByTestId('field-completion-metrics')).toBeVisible();
      await expect(page.getByTestId('required-fields-completion-rate')).toBeVisible();
      await expect(page.getByTestId('optional-fields-completion-rate')).toBeVisible();
      
      // View data quality scores
      await page.getByTestId('data-quality-scores-section').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('overall-quality-score')).toBeVisible();
      await expect(page.getByTestId('completeness-score')).toBeVisible();
      await expect(page.getByTestId('accuracy-score')).toBeVisible();
      await expect(page.getByTestId('consistency-score')).toBeVisible();
      
      // View field-specific quality metrics
      await page.getByTestId('field-quality-analysis').scrollIntoViewIfNeeded();
      await expect(page.getByTestId('field-completion-table')).toBeVisible();
      
      // Run data validation checks
      await page.getByTestId('run-validation-checks-button').click();
      await expect(page.getByTestId('validation-progress')).toBeVisible();
      
      await expect(page.getByTestId('validation-results')).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId('data-inconsistencies-section')).toBeVisible();
      await expect(page.getByTestId('missing-data-section')).toBeVisible();
      await expect(page.getByTestId('data-quality-recommendations')).toBeVisible();
      
      // Configure data quality alerts
      await page.getByTestId('configure-quality-alerts-button').click();
      await expect(page.getByTestId('alert-configuration-panel')).toBeVisible();
      
      await page.getByTestId('completion-rate-threshold').fill('85');
      await page.getByTestId('quality-score-threshold').fill('80');
      await page.getByTestId('enable-weekly-reports').check();
      await page.getByTestId('alert-recipients').fill('dc-team@company.com');
      
      await page.getByTestId('save-quality-alerts').click();
      await expect(page.getByTestId('alerts-configured-success')).toBeVisible();

      console.log('✅ DC data quality validation completed');
    });
  });
});