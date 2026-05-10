import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge component as seen in the Asset Master List.
 * Renders a rounded pill with a status dot and text.
 */
const StatusBadge = ({ status, className = '' }) => {
  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return {
          bg: 'bg-[#EAF7ED]',
          text: 'text-[#28A745]',
          dot: 'bg-[#28A745]'
        };
      case 'ALLOCATED':
      case 'ASSIGNED':
        return {
          bg: 'bg-[#E8F6F8]',
          text: 'text-[#17A2B8]',
          dot: 'bg-[#17A2B8]'
        };
      case 'SPARE':
        return {
          bg: 'bg-[#F0F2FF]',
          text: 'text-[#3F51B5]',
          dot: 'bg-[#3F51B5]'
        };
      case 'UNDER_REPAIR':
        return {
          bg: 'bg-[#FFF9E6]',
          text: 'text-[#FFC107]',
          dot: 'bg-[#FFC107]'
        };
      case 'DECOMMISSIONED':
        return {
          bg: 'bg-[#FDECEA]',
          text: 'text-[#DC3545]',
          dot: 'bg-[#DC3545]'
        };
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-600',
          dot: 'bg-slate-400'
        };
    }
  };

  const styles = getStatusStyles(status);
  
  // Unify display label: ASSIGNED -> ALLOCATED
  const displayLabel = status?.toUpperCase() === 'ASSIGNED' ? 'ALLOCATED' : status?.replace('_', ' ');

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
      text-[11px] font-bold uppercase tracking-wider
      ${styles.bg} ${styles.text} ${className}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
      {displayLabel}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default StatusBadge;
