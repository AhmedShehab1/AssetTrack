import React from 'react';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px 0 rgba(63, 81, 181, 0.39)',
        };
      case 'secondary':
        return {
          backgroundColor: '#FFFFFF',
          color: 'var(--primary)',
          border: '1px solid var(--primary)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        };
      default:
        return {};
    }
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    outline: 'none',
    ...getVariantStyles()
  };

  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      style={baseStyle}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
        else e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
      }}
      onMouseLeave={(e) => {
        const styles = getVariantStyles();
        e.currentTarget.style.backgroundColor = styles.backgroundColor;
      }}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
