import React from 'react';

interface TerminalProps {
  output?: string[];
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ output = [], className = '' }) => {
  return (
    <div className={`bg-black text-green-400 font-mono p-4 rounded ${className}`}>
      {output.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
};

export default Terminal;