import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    Pass: 'bg-green-100 text-green-800',
    'Review/Warning': 'bg-amber-100 text-amber-800',
    'Blocked/Fail': 'bg-red-100 text-red-800',
    Warning: 'bg-amber-100 text-amber-800',
    Fail: 'bg-red-100 text-red-800'
  };

  const selectedConfig = config[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedConfig}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
