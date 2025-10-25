import React from 'react';

/**
 * TRR Status Badge Component
 * Displays status with appropriate colors matching schema enum
 * Supports all 9 status states from TRRStatusEnum
 */

export type TRRStatusType =
  | 'draft'
  | 'pending'
  | 'in-progress'
  | 'in_review'
  | 'validated'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed';

interface TRRStatusProps {
  status: TRRStatusType;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  draft: {
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    label: 'Draft',
    icon: '📝',
  },
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    label: 'Pending',
    icon: '⏳',
  },
  'in-progress': {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    label: 'In Progress',
    icon: '🔄',
  },
  in_review: {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    label: 'In Review',
    icon: '👀',
  },
  validated: {
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    label: 'Validated',
    icon: '✓',
  },
  approved: {
    color: 'bg-green-100 text-green-800 border-green-300',
    label: 'Approved',
    icon: '✅',
  },
  rejected: {
    color: 'bg-red-100 text-red-800 border-red-300',
    label: 'Rejected',
    icon: '❌',
  },
  completed: {
    color: 'bg-green-100 text-green-800 border-green-300',
    label: 'Completed',
    icon: '🎉',
  },
  failed: {
    color: 'bg-red-100 text-red-800 border-red-300',
    label: 'Failed',
    icon: '⚠️',
  },
};

export const TRRStatus: React.FC<TRRStatusProps> = ({
  status,
  className = '',
  showIcon = false,
}) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}
    >
      {showIcon && <span className="text-xs">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

export default TRRStatus;