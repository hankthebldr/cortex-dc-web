'use client';

/**
 * Domain Consultant Workspace Component
 * Migrated from henryreed.ai/hosting/components/DomainConsultantWorkspace.tsx
 *
 * Features:
 * - Quick stats dashboard
 * - Active engagements overview
 * - TRR status tracking
 * - Quick action buttons
 * - Workspace metrics
 */

import React from 'react';
import { CortexButton } from '../CortexButton';

export interface WorkspaceStats {
  activeEngagements: number;
  completedTRRs: number;
  pendingTRRs: number;
  highRiskItems: number;
}

export interface DomainConsultantWorkspaceProps {
  /** Currently selected engagement ID */
  selectedEngagement?: string;
  /** Currently selected TRR ID */
  selectedTRR?: string;
  /** Workspace statistics */
  stats?: WorkspaceStats;
  /** Callback when Create TRR is clicked */
  onCreateTRR?: () => void;
  /** Callback when View Reports is clicked */
  onViewReports?: () => void;
  /** Callback when New POV is clicked */
  onNewPOV?: () => void;
  /** Callback when Schedule Demo is clicked */
  onScheduleDemo?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const DomainConsultantWorkspace: React.FC<DomainConsultantWorkspaceProps> = ({
  selectedEngagement,
  selectedTRR,
  stats = {
    activeEngagements: 5,
    completedTRRs: 12,
    pendingTRRs: 8,
    highRiskItems: 3
  },
  onCreateTRR,
  onViewReports,
  onNewPOV,
  onScheduleDemo,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-4">
          Domain Consultant Workspace
        </h1>
        <p className="text-gray-400 mb-6">
          Manage your engagements, TRRs, and POV projects from a centralized workspace.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">{stats.activeEngagements}</div>
            <div className="text-sm text-gray-400">Active Engagements</div>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">{stats.completedTRRs}</div>
            <div className="text-sm text-gray-400">Completed TRRs</div>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.pendingTRRs}</div>
            <div className="text-sm text-gray-400">Pending TRRs</div>
          </div>
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">{stats.highRiskItems}</div>
            <div className="text-sm text-gray-400">High Risk</div>
          </div>
        </div>

        {/* Selected Items */}
        {(selectedEngagement || selectedTRR) && (
          <div className="mt-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Current Selection</h3>
            {selectedEngagement && (
              <div className="text-sm text-gray-400">
                <span className="text-gray-300">Engagement:</span> {selectedEngagement}
              </div>
            )}
            {selectedTRR && (
              <div className="text-sm text-gray-400">
                <span className="text-gray-300">TRR:</span> {selectedTRR}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <CortexButton
              variant="primary"
              icon="📝"
              onClick={onCreateTRR}
            >
              Create TRR
            </CortexButton>
            <CortexButton
              variant="outline"
              icon="📊"
              onClick={onViewReports}
            >
              View Reports
            </CortexButton>
            <CortexButton
              variant="outline"
              icon="🎯"
              onClick={onNewPOV}
            >
              New POV
            </CortexButton>
            <CortexButton
              variant="outline"
              icon="📅"
              onClick={onScheduleDemo}
            >
              Schedule Demo
            </CortexButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainConsultantWorkspace;
