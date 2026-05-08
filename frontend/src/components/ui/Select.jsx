import { forwardRef } from 'react';

const Select = forwardRef(({ label, icon: Icon, error, className = '', options = [], ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={props.name} className="text-label-caps text-text-heading font-bold uppercase tracking-wider">
            {label}
          </label>
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-outline" />
          </div>
        )}
        <select
          id={props.name}
          ref={ref}
          className={`
            w-full bg-surface-container-lowest border rounded-md py-2 text-on-surface
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-colors appearance-none
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-danger-expired focus:ring-danger-expired' : 'border-outline-variant'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow to replace the native appearance */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-sm text-danger-expired mt-1">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
