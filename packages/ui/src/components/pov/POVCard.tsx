import React from 'react';
import { Card } from '../Card';

interface POVCardProps {
  title: string;
  description?: string;
  className?: string;
}

export const POVCard: React.FC<POVCardProps> = ({ title, description, className }) => {
  return (
    <Card className={className}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </Card>
  );
};

export default POVCard;