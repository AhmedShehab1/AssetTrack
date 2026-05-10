import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-[#EAF7ED] text-[#28A745]',
    danger: 'bg-[#FDECEA] text-[#DC3545]',
    warning: 'bg-[#FFF9E6] text-[#FFC107]',
    info: 'bg-[#E8F6F8] text-[#17A2B8]',
    default: 'bg-slate-100 text-slate-500',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 
      rounded-full text-[10px] font-bold uppercase tracking-wider
      ${variants[variant] || variants.default}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;
