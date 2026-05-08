import React from 'react';

const Card = ({ children, className = '', padding = '24px', style: customStyle = {} }) => {
  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-md)',
    padding: padding,
    border: '1px solid var(--border-color)',
    ...customStyle
  };

  return (
    <div className={`card ${className}`} style={cardStyle}>
      {children}
    </div>
  );
};

export default Card;
