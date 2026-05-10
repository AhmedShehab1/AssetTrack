import React from 'react';

const Card = ({ children, className = '', padding = 'p-6', onClick }) => {
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md border border-outline-variant 
        ${padding} 
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
