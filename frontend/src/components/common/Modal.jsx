import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Optimized Modal component with smooth spring-elastic transitions 
 * and perfect viewport height matching.
 */
const Modal = ({ isOpen, onClose, title, subtitle, children, badgeText }) => {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Two-step animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = 'unset';
      }, 600); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-[600ms] ${animate ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-[600ms] ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Modal Panel */}
      <div 
        className={`
          relative w-full max-w-[500px] h-[100dvh] bg-white shadow-2xl flex flex-col 
          transform transition-transform duration-[600ms] border-l border-outline-variant
          ${animate ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-outline-variant bg-slate-50/50 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-extrabold text-text-heading leading-tight m-0">{title}</h2>
              {badgeText && (
                <span className="bg-primary-light text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/10">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-text-body font-bold uppercase tracking-wider opacity-60 m-0 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-text-body hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-outline-variant"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-8 font-sans custom-scrollbar pb-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
