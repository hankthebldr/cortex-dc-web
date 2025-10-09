import React from 'react';

interface TRRStatusProps {
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  className?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export const TRRStatus: React.FC<TRRStatusProps> = ({ status, className = '' }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default TRRStatus;