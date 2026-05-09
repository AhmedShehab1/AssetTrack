import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border border-amber-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100",
    info: "bg-sky-50 text-sky-600 border border-sky-100",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
