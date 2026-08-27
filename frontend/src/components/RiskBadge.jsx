import React from 'react';

const RiskBadge = ({ riskLevel }) => {
  const config = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Critical: 'bg-red-100 text-red-800 border-red-200'
  };

  const selectedConfig = config[riskLevel] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedConfig}`}>
      {riskLevel}
    </span>
  );
};

export default RiskBadge;
