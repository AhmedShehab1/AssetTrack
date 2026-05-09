import React from 'react';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, disabled, style, ...props }) => {
  const variants = {
    primary: {
      base: {
        backgroundColor: '#3D4EC6',
        color: '#FFFFFF',
        border: 'none',
      },
      hover: { backgroundColor: '#2E3BAD' },
    },
    secondary: {
      base: {
        backgroundColor: '#F0F1FA',
        color: '#3D4EC6',
        border: 'none',
      },
      hover: { backgroundColor: '#E2E4F5' },
    },
    ghost: {
      base: {
        backgroundColor: 'transparent',
        color: '#6C757D',
        border: 'none',
      },
      hover: { backgroundColor: '#F8F9FA' },
    },
    outline: {
      base: {
        backgroundColor: 'transparent',
        color: '#3D4EC6',
        border: '1.5px solid #D0D3EC',
      },
      hover: { backgroundColor: '#F0F1FA' },
    },
    danger: {
      base: {
        backgroundColor: '#DC3545',
        color: '#FFFFFF',
        border: 'none',
      },
      hover: { backgroundColor: '#C82333' },
    },
  };

  const current = variants[variant] || variants.primary;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '1',
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    whiteSpace: 'nowrap',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '0.01em',
    ...current.base,
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      Object.assign(e.currentTarget.style, current.hover);
    }
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.currentTarget.style, current.base);
    // restore any overrides from the style prop
    if (style?.backgroundColor) e.currentTarget.style.backgroundColor = style.backgroundColor;
  };

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      style={baseStyle}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  );
};

export default Button;
