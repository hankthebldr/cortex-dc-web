'use client';

/**
 * POV Management Component
 * Migrated from henryreed.ai/hosting/components/POVManagement.tsx
 *
 * Comprehensive Proof of Value (POV) project management interface with:
 * - Project lifecycle tracking (planning → completion)
 * - Customer and stakeholder management
 * - Scenario deployment and validation
 * - Timeline and milestone tracking
 * - Deliverables management
 * - Communication coordination
 * - Key metrics and business value tracking
 * - Interactive tab-based interface
 */

import React, { useState, useEffect } from 'react';
import { CortexButton } from '../CortexButton';

export interface POVProject {
  id: string;
  name: string;
  customer: {
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    contacts: Array<{ name: string; email: string; role: string; }>;
  };
  status: 'planning' | 'active' | 'testing' | 'demo-ready' | 'completed' | 'paused' | 'cancelled';
  phase: 'discovery' | 'design' | 'deployment' | 'validation' | 'demonstration' | 'closure';
  scenarios: Array<{
    id: string;
    type: string;
    status: 'planned' | 'deployed' | 'tested' | 'validated';
    provider: string;
  }>;
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      name: string;
      date: string;
      completed: boolean;
      description?: string;
    }>;
  };
  objectives: string[];
  successCriteria: string[];
  resources: {
    teamLead: string;
    participants: string[];
    budget?: number;
    infrastructure: string[];
  };
  communication: {
    slackChannel?: string;
    meetingCadence: 'daily' | 'weekly' | 'bi-weekly' | 'as-needed';
    nextMeeting?: string;
    lastUpdate: string;
  };
  deliverables: Array<{
    name: string;
    type: 'report' | 'demo' | 'training' | 'documentation' | 'proposal';
    status: 'planned' | 'in-progress' | 'completed';
    dueDate: string;
    assignee?: string;
  }>;
  metrics: {
    detectionsCovered: number;
    scenariosDeployed: number;
    stakeholdersSatisfied: number;
    businessValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface POVManagementProps {
  /** Initial POV projects to display */
  initialProjects?: POVProject[];
  /** Callback when a new POV is created */
  onCreatePOV?: () => void | Promise<void>;
  /** Callback when a scenario is deployed */
  onScenarioDeploy?: (scenarioType: string, povId: string) => void | Promise<void>;
  /** Callback when a report is generated */
  onGenerateReport?: (povId: string) => void | Promise<void>;
  /** Callback when executing a command */
  onCommandExecute?: (command: string) => void | Promise<void>;
  /** Callback for notifications */
  onNotify?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

const SAMPLE_POVS: POVProject[] = [
  {
    id: 'POV-2024-001',
    name: 'Global Financial Services - Multi-Cloud Security Assessment',
    customer: {
      name: 'Global Financial Services Corp',
      industry: 'Financial Services',
      size: 'enterprise',
      contacts: [
        { name: 'Sarah Chen', email: 'sarah.chen@gfs.com', role: 'CISO' },
        { name: 'Michael Torres', email: 'm.torres@gfs.com', role: 'IT Director' },
        { name: 'Amanda Liu', email: 'a.liu@gfs.com', role: 'Security Architect' }
      ]
    },
    status: 'active',
    phase: 'validation',
    scenarios: [
      { id: 'SCEN-001', type: 'cloud-posture', status: 'validated', provider: 'aws' },
      { id: 'SCEN-002', type: 'insider-threat', status: 'tested', provider: 'azure' },
      { id: 'SCEN-003', type: 'ransomware', status: 'deployed', provider: 'gcp' }
    ],
    timeline: {
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-03-15T00:00:00Z',
      milestones: [
        { name: 'Discovery Complete', date: '2024-01-22T00:00:00Z', completed: true },
        { name: 'Environment Setup', date: '2024-01-29T00:00:00Z', completed: true },
        { name: 'Scenario Deployment', date: '2024-02-12T00:00:00Z', completed: true },
        { name: 'Validation Testing', date: '2024-02-26T00:00:00Z', completed: false },
        { name: 'Executive Demo', date: '2024-03-08T00:00:00Z', completed: false },
        { name: 'Final Report', date: '2024-03-15T00:00:00Z', completed: false }
      ]
    },
    objectives: [
      'Assess multi-cloud security posture across AWS, Azure, and GCP',
      'Validate XSIAM detection capabilities for hybrid cloud environments',
      'Demonstrate ROI and business value of unified security operations',
      'Provide actionable recommendations for security improvements'
    ],
    successCriteria: [
      '95% threat detection coverage across all cloud environments',
      'Reduced mean time to detection (MTTD) by 60%',
      'Unified security operations dashboard for all cloud providers',
      'Executive stakeholder approval for full deployment'
    ],
    resources: {
      teamLead: 'Henry Reed',
      participants: ['Sarah Chen', 'Michael Torres', 'Amanda Liu', 'Security Team'],
      budget: 150000,
      infrastructure: ['XSIAM tenant', 'Cloud connectors', 'Test environments']
    },
    communication: {
      slackChannel: '#gfs-pov-2024',
      meetingCadence: 'weekly',
      nextMeeting: '2024-01-25T15:00:00Z',
      lastUpdate: '2024-01-22T14:30:00Z'
    },
    deliverables: [
      {
        name: 'Technical Architecture Review',
        type: 'report',
        status: 'completed',
        dueDate: '2024-01-29T00:00:00Z',
        assignee: 'Henry Reed'
      },
      {
        name: 'Executive Dashboard Demo',
        type: 'demo',
        status: 'in-progress',
        dueDate: '2024-03-08T00:00:00Z',
        assignee: 'Henry Reed'
      },
      {
        name: 'Security Posture Report',
        type: 'report',
        status: 'planned',
        dueDate: '2024-03-15T00:00:00Z',
        assignee: 'Amanda Liu'
      }
    ],
    metrics: {
      detectionsCovered: 47,
      scenariosDeployed: 3,
      stakeholdersSatisfied: 85,
      businessValue: 2400000
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-22T14:30:00Z'
  },
  {
    id: 'POV-2024-002',
    name: 'TechCorp Industries - DevSecOps Integration',
    customer: {
      name: 'TechCorp Industries',
      industry: 'Technology',
      size: 'large',
      contacts: [
        { name: 'Marcus Johnson', email: 'marcus.johnson@techcorp.io', role: 'DevSecOps Lead' },
        { name: 'Elena Rodriguez', email: 'elena.rodriguez@techcorp.io', role: 'VP Engineering' }
      ]
    },
    status: 'demo-ready',
    phase: 'demonstration',
    scenarios: [
      { id: 'SCEN-004', type: 'container-vuln', status: 'validated', provider: 'k8s' },
      { id: 'SCEN-005', type: 'pipeline-breach', status: 'validated', provider: 'local' }
    ],
    timeline: {
      startDate: '2024-01-08T00:00:00Z',
      endDate: '2024-02-23T00:00:00Z',
      milestones: [
        { name: 'Requirements Gathering', date: '2024-01-12T00:00:00Z', completed: true },
        { name: 'CI/CD Integration', date: '2024-01-26T00:00:00Z', completed: true },
        { name: 'Container Security Testing', date: '2024-02-09T00:00:00Z', completed: true },
        { name: 'Demo Preparation', date: '2024-02-20T00:00:00Z', completed: true },
        { name: 'Stakeholder Demo', date: '2024-02-23T00:00:00Z', completed: false }
      ]
    },
    objectives: [
      'Integrate XSIAM with CI/CD pipelines for continuous security monitoring',
      'Demonstrate container security capabilities in Kubernetes environments',
      'Validate automated incident response for DevSecOps workflows'
    ],
    successCriteria: [
      'Zero-touch security integration in CI/CD pipelines',
      'Automated vulnerability detection and response',
      'Developer adoption rate above 80%'
    ],
    resources: {
      teamLead: 'Henry Reed',
      participants: ['Marcus Johnson', 'Elena Rodriguez', 'DevOps Team'],
      infrastructure: ['Kubernetes cluster', 'CI/CD tools', 'XSIAM integration']
    },
    communication: {
      slackChannel: '#techcorp-devsecops-pov',
      meetingCadence: 'bi-weekly',
      nextMeeting: '2024-01-30T10:00:00Z',
      lastUpdate: '2024-01-20T16:45:00Z'
    },
    deliverables: [
      {
        name: 'DevSecOps Integration Guide',
        type: 'documentation',
        status: 'completed',
        dueDate: '2024-02-15T00:00:00Z',
        assignee: 'Marcus Johnson'
      },
      {
        name: 'Container Security Demo',
        type: 'demo',
        status: 'completed',
        dueDate: '2024-02-20T00:00:00Z',
        assignee: 'Henry Reed'
      }
    ],
    metrics: {
      detectionsCovered: 23,
      scenariosDeployed: 2,
      stakeholdersSatisfied: 92,
      businessValue: 800000
    },
    createdAt: '2024-01-08T10:30:00Z',
    updatedAt: '2024-01-20T16:45:00Z'
  }
];

const POV_STATUS_COLORS = {
  'planning': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'active': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'testing': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'demo-ready': 'bg-green-500/20 text-green-400 border-green-500/30',
  'completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'paused': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const POVManagement: React.FC<POVManagementProps> = ({
  initialProjects = SAMPLE_POVS,
  onCreatePOV,
  onScenarioDeploy,
  onGenerateReport,
  onCommandExecute,
  onNotify
}) => {
  const [povProjects, setPovProjects] = useState<POVProject[]>(initialProjects);
  const [selectedPOV, setSelectedPOV] = useState<POVProject | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'timeline' | 'deliverables' | 'communication'>('overview');

  const handleCreatePOV = async () => {
    if (onCreatePOV) {
      await onCreatePOV();
    } else if (onCommandExecute) {
      await onCommandExecute('pov init --interactive --template executive-overview');
    }
  };

  const handleScenarioDeploy = async (scenarioType: string) => {
    if (!selectedPOV) return;

    if (onScenarioDeploy) {
      await onScenarioDeploy(scenarioType, selectedPOV.id);
    } else if (onCommandExecute) {
      await onCommandExecute(`scenario generate --scenario-type ${scenarioType} --provider gcp --auto-validate`);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedPOV) return;

    if (onGenerateReport) {
      await onGenerateReport(selectedPOV.id);
    } else if (onCommandExecute) {
      await onCommandExecute(`pov report --current --format executive --include-metrics --export pdf`);
    }
  };

  const getPhaseProgress = (pov: POVProject): number => {
    const completedMilestones = pov.timeline.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / pov.timeline.milestones.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">🎯 POV Management</h1>
          <p className="text-gray-400 mt-2">
            Proof of Value project lifecycle and stakeholder management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <CortexButton
            onClick={handleCreatePOV}
            variant="primary"
            icon="🎯"
          >
            New POV
          </CortexButton>
          <CortexButton
            onClick={() => onNotify?.('info', 'POV template library coming soon')}
            variant="outline"
            icon="📋"
          >
            Templates
          </CortexButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* POV List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100">Active POVs</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {povProjects.map((pov) => (
                <div
                  key={pov.id}
                  onClick={() => setSelectedPOV(pov)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                    selectedPOV?.id === pov.id ? 'bg-gray-700/50 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-100 text-sm">{pov.customer.name}</h3>
                    <p className="text-xs text-gray-400">{pov.id}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs border ${POV_STATUS_COLORS[pov.status]}`}>
                        {pov.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getPhaseProgress(pov)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${getPhaseProgress(pov)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* POV Details */}
        <div className="lg:col-span-3">
          {selectedPOV ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              {/* POV Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100">{selectedPOV.name}</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-400">ID: {selectedPOV.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs border ${POV_STATUS_COLORS[selectedPOV.status]}`}>
                        {selectedPOV.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-400">
                        Phase: <span className="text-gray-100 font-medium">{selectedPOV.phase}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <CortexButton
                      onClick={handleGenerateReport}
                      variant="primary"
                      size="sm"
                      icon="📊"
                    >
                      Generate Report
                    </CortexButton>
                    <CortexButton
                      onClick={() => onCommandExecute?.(`pov demo-setup --scenario ${selectedPOV.scenarios[0]?.type || 'cloud-posture'} --interactive`)}
                      variant="outline"
                      size="sm"
                      icon="🎬"
                    >
                      Prep Demo
                    </CortexButton>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-900 rounded-lg p-1 mt-6">
                  {(['overview', 'scenarios', 'timeline', 'deliverables', 'communication'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === tab
                          ? 'bg-green-500 text-black shadow-lg'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/50'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-3">🏢 Customer Information</h3>
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-400">Industry:</span>
                            <p className="text-gray-100">{selectedPOV.customer.industry}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-400">Size:</span>
                            <p className="text-gray-100">{selectedPOV.customer.size}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-sm font-medium text-gray-400">Key Contacts:</span>
                          <div className="mt-2 space-y-2">
                            {selectedPOV.customer.contacts.map((contact, index) => (
                              <div key={index} className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-100 font-medium">{contact.name}</span>
                                <span className="text-gray-500">{contact.role}</span>
                                <span className="text-gray-400">{contact.email}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Objectives & Success Criteria */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-3">🎯 Objectives</h3>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <ul className="space-y-2">
                            {selectedPOV.objectives.map((objective, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span className="text-gray-100">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-3">✅ Success Criteria</h3>
                        <div className="bg-gray-900 p-4 rounded-lg">
                          <ul className="space-y-2">
                            {selectedPOV.successCriteria.map((criteria, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm">
                                <span className="text-cyan-500 mt-0.5">•</span>
                                <span className="text-gray-100">{criteria}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-3">📈 Key Metrics</h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-500">{selectedPOV.metrics.detectionsCovered}</div>
                          <div className="text-xs text-gray-500">Detections Covered</div>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-cyan-500">{selectedPOV.metrics.scenariosDeployed}</div>
                          <div className="text-xs text-gray-500">Scenarios Deployed</div>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-500">{selectedPOV.metrics.stakeholdersSatisfied}%</div>
                          <div className="text-xs text-gray-500">Stakeholder Satisfaction</div>
                        </div>
                        <div className="bg-gray-900 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-emerald-500">${(selectedPOV.metrics.businessValue / 1000000).toFixed(1)}M</div>
                          <div className="text-xs text-gray-500">Business Value</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'scenarios' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-100">🔬 Deployed Scenarios</h3>
                      <CortexButton
                        onClick={() => handleScenarioDeploy('cloud-posture')}
                        variant="outline"
                        size="sm"
                        icon="➕"
                      >
                        Add Scenario
                      </CortexButton>
                    </div>
                    <div className="space-y-3">
                      {selectedPOV.scenarios.map((scenario, index) => (
                        <div key={index} className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-100">{scenario.type}</h4>
                            <p className="text-sm text-gray-400">ID: {scenario.id} • Provider: {scenario.provider}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              scenario.status === 'validated' ? 'bg-emerald-500/20 text-emerald-400' :
                              scenario.status === 'tested' ? 'bg-cyan-500/20 text-cyan-400' :
                              scenario.status === 'deployed' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {scenario.status.toUpperCase()}
                            </span>
                            <CortexButton
                              onClick={() => onCommandExecute?.(`scenario status ${scenario.id}`)}
                              variant="outline"
                              size="sm"
                              icon="📊"
                            >
                              Status
                            </CortexButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-100">📅 Project Timeline</h3>
                    <div className="space-y-4">
                      {selectedPOV.timeline.milestones.map((milestone, index) => (
                        <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg ${
                          milestone.completed ? 'bg-emerald-500/10' : 'bg-gray-900'
                        }`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            milestone.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-gray-500'
                          }`}>
                            {milestone.completed && (
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${milestone.completed ? 'text-emerald-400' : 'text-gray-100'}`}>
                              {milestone.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Due: {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'deliverables' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-100">📋 Project Deliverables</h3>
                    <div className="space-y-3">
                      {selectedPOV.deliverables.map((deliverable, index) => (
                        <div key={index} className="bg-gray-900 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-100">{deliverable.name}</h4>
                              <p className="text-sm text-gray-400">
                                Type: {deliverable.type} • Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                                {deliverable.assignee && ` • Assignee: ${deliverable.assignee}`}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              deliverable.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              deliverable.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {deliverable.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'communication' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-100">💬 Communication</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-100 mb-3">Team Communication</h4>
                        <div className="space-y-2 text-sm">
                          {selectedPOV.communication.slackChannel && (
                            <div>
                              <span className="text-gray-400">Slack Channel:</span>
                              <span className="text-gray-100 ml-2">{selectedPOV.communication.slackChannel}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-400">Meeting Cadence:</span>
                            <span className="text-gray-100 ml-2">{selectedPOV.communication.meetingCadence}</span>
                          </div>
                          {selectedPOV.communication.nextMeeting && (
                            <div>
                              <span className="text-gray-400">Next Meeting:</span>
                              <span className="text-gray-100 ml-2">
                                {new Date(selectedPOV.communication.nextMeeting).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-100 mb-3">Project Team</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Team Lead:</span>
                            <span className="text-gray-100 ml-2">{selectedPOV.resources.teamLead}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Participants:</span>
                            <div className="ml-2 mt-1">
                              {selectedPOV.resources.participants.map((participant, index) => (
                                <div key={index} className="text-gray-100">• {participant}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-bold text-gray-100 mb-2">Select a POV Project</h2>
              <p className="text-gray-400">
                Choose a Proof of Value project from the list to view details and manage its lifecycle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POVManagement;
