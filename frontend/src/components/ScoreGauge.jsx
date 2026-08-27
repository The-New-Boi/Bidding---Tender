import React from 'react';

const ScoreGauge = ({ score }) => {
  let color = 'text-green-500';
  if (score < 50) color = 'text-red-500';
  else if (score < 80) color = 'text-yellow-500';

  return (
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
        <div className={`h-2.5 rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }}></div>
      </div>
      <span className={`font-semibold ${color}`}>{score}/100</span>
    </div>
  );
};

export default ScoreGauge;
