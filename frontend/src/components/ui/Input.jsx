import { forwardRef } from 'react';

const Input = forwardRef(({ label, rightLabel, icon: Icon, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-1 w-full">
      {(label || rightLabel) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <label htmlFor={props.name} className="text-label-caps text-text-heading font-bold uppercase tracking-wider">
              {label}
            </label>
          )}
          {rightLabel && (
            <span className="text-body-md text-primary font-medium hover:underline cursor-pointer">
              {rightLabel}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-outline" />
          </div>
        )}
        <input
          id={props.name}
          ref={ref}
          className={`
            w-full bg-surface-container-lowest border rounded-md py-2 text-on-surface
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            transition-colors
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-danger-expired focus:ring-danger-expired' : 'border-outline-variant'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-danger-expired mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
