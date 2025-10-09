/**
 * Mock implementations for Genkit/Vertex AI for deterministic E2E testing
 */

export interface ScenarioRecommendation {
  recommendationId: string;
  scenarios: Array<{
    id: string;
    title: string;
    score: number;
    description?: string;
    estimatedDuration?: number;
    complexity?: 'basic' | 'intermediate' | 'advanced';
  }>;
  inputEcho?: any;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

/**
 * Mock scenario recommendation for consistent testing
 */
export function mockScenarioRecommendation(input: any): ScenarioRecommendation {
  return {
    recommendationId: `rec-e2e-${Date.now()}`,
    scenarios: [
      {
        id: 'scn-network-optimization',
        title: 'Network Performance Optimization', 
        score: 0.92,
        description: 'Implement advanced network segmentation and traffic optimization',
        estimatedDuration: 1800, // 30 minutes
        complexity: 'intermediate'
      },
      {
        id: 'scn-cost-reduction',
        title: 'Infrastructure Cost Reduction',
        score: 0.87,
        description: 'Optimize cloud resource allocation and eliminate waste',
        estimatedDuration: 2400, // 40 minutes  
        complexity: 'advanced'
      },
      {
        id: 'scn-security-hardening',
        title: 'Security Posture Enhancement',
        score: 0.84,
        description: 'Strengthen security controls and compliance frameworks',
        estimatedDuration: 3600, // 60 minutes
        complexity: 'advanced'
      }
    ],
    inputEcho: input,
    confidence: 0.89,
    reasoning: 'Selected scenarios based on customer industry (Manufacturing) and stated security/efficiency objectives. High confidence due to clear requirements alignment.',
    timestamp: new Date().toISOString()
  };
}

/**
 * Mock POV generation for testing
 */
export function mockPOVGeneration(input: {
  customer: string;
  industry?: string;
  objectives?: string[];
  timeline?: { start: Date; end: Date };
}): any {
  return {
    povId: `pov-mock-${Date.now()}`,
    title: `${input.customer} Digital Transformation POV`,
    executiveSummary: 'AI-generated executive summary focusing on security modernization and operational efficiency improvements.',
    keyObjectives: [
      'Enhance network security posture through zero-trust architecture',
      'Reduce operational costs by 25% through automation',
      'Improve incident response time by 60%',
      'Achieve compliance with industry regulations'
    ],
    recommendedScenarios: mockScenarioRecommendation(input).scenarios.map(s => s.id),
    timeline: {
      totalDuration: 90, // days
      phases: [
        { name: 'Discovery & Assessment', duration: 14, key_activities: ['Current state analysis', 'Gap assessment'] },
        { name: 'Solution Design', duration: 21, key_activities: ['Architecture design', 'Implementation planning'] },
        { name: 'Pilot Implementation', duration: 30, key_activities: ['Proof of concept', 'Initial deployment'] },
        { name: 'Validation & Optimization', duration: 25, key_activities: ['Testing', 'Performance tuning'] }
      ]
    },
    businessJustification: {
      estimatedROI: '300%',
      paybackPeriod: '8 months',
      riskMitigation: 'High - addresses critical security vulnerabilities',
      strategicAlignment: 'Excellent - supports digital transformation initiatives'
    },
    generatedAt: new Date().toISOString(),
    confidence: 0.91,
    model: 'mock-vertex-ai'
  };
}

/**
 * Mock TRR (Technical Risk Review) assessment
 */
export function mockTRRAssessment(input: {
  povId: string;
  scenarios: string[];
  environment: any;
}): any {
  return {
    trrId: `trr-mock-${Date.now()}`,
    povId: input.povId,
    riskLevel: 'medium',
    overallScore: 7.3,
    assessmentAreas: [
      {
        area: 'Technical Complexity',
        score: 6.8,
        risks: [
          { level: 'medium', description: 'Integration complexity with legacy systems', mitigation: 'Phased migration approach' }
        ]
      },
      {
        area: 'Resource Requirements',
        score: 7.5,
        risks: [
          { level: 'low', description: 'Limited specialized expertise', mitigation: 'Training and external consulting' }
        ]
      },
      {
        area: 'Timeline Feasibility',
        score: 8.1,
        risks: [
          { level: 'low', description: 'Aggressive timeline for complex scenarios', mitigation: 'Buffer time allocation' }
        ]
      }
    ],
    recommendations: [
      'Implement comprehensive testing protocol for each phase',
      'Establish clear rollback procedures for critical components',
      'Ensure adequate stakeholder communication throughout project'
    ],
    approvalStatus: 'pending',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    model: 'mock-vertex-ai'
  };
}

/**
 * Mock content generation for various types
 */
export function mockContentGeneration(type: 'email' | 'report' | 'presentation' | 'documentation', context: any): any {
  const baseResponse = {
    contentId: `content-mock-${type}-${Date.now()}`,
    type,
    context,
    generatedAt: new Date().toISOString(),
    model: 'mock-vertex-ai'
  };

  switch (type) {
    case 'email':
      return {
        ...baseResponse,
        subject: `POV Update: ${context.customer || 'Customer'} Project Progress`,
        body: 'Mock email content with professional tone and key updates...',
        tone: 'professional',
        length: 'medium'
      };
    
    case 'report':
      return {
        ...baseResponse,
        title: `${context.customer || 'Customer'} Technical Assessment Report`,
        sections: [
          { title: 'Executive Summary', content: 'High-level overview...' },
          { title: 'Technical Findings', content: 'Detailed technical analysis...' },
          { title: 'Recommendations', content: 'Strategic recommendations...' }
        ],
        format: 'markdown'
      };
    
    case 'presentation':
      return {
        ...baseResponse,
        title: `${context.customer || 'Customer'} POV Presentation`,
        slides: [
          { title: 'Overview', content: 'Project overview and objectives' },
          { title: 'Solution Architecture', content: 'Technical solution details' },
          { title: 'Implementation Roadmap', content: 'Timeline and milestones' },
          { title: 'Business Impact', content: 'ROI and success metrics' }
        ],
        format: 'pptx'
      };
    
    default:
      return {
        ...baseResponse,
        content: 'Mock generated content for testing purposes',
        format: 'text'
      };
  }
}

/**
 * Helper to check if we're in mock mode
 */
export function isGenkitMockMode(): boolean {
  return process.env.GENKIT_PROVIDER === 'mock' || process.env.NODE_ENV === 'test';
}

/**
 * Mock delay to simulate AI processing time
 */
export async function mockDelay(minMs = 500, maxMs = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
}

export default {
  mockScenarioRecommendation,
  mockPOVGeneration,
  mockTRRAssessment,
  mockContentGeneration,
  isGenkitMockMode,
  mockDelay
};