import React from 'react';

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark',
    secondary: 'bg-white text-primary border border-primary hover:bg-slate-50',
    ghost: 'bg-transparent text-text-body hover:bg-slate-100',
    outline: 'bg-transparent text-text-heading border border-outline-variant hover:bg-slate-50',
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center gap-2.5 
        px-5 py-2.5 rounded-xl
        text-sm font-semibold 
        transition-all duration-200 
        active:scale-95
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;
