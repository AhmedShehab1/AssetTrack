import React from 'react';

const Card = ({ children, className = '', p = 'p-6' }) => {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl shadow-sm ${p} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
