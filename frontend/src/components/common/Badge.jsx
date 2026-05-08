import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: 'var(--success-bg)', color: 'var(--success)' };
      case 'danger':
        return { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' };
      case 'warning':
        return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' };
      case 'info':
        return { backgroundColor: 'var(--info-bg)', color: 'var(--info)' };
      default:
        return { backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' };
    }
  };

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    ...getStyles()
  };

  return (
    <span className={`badge ${className}`} style={style}>
      {children}
    </span>
  );
};

export default Badge;
