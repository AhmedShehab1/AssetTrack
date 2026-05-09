import { forwardRef } from 'react';

const Input = forwardRef(({ label, rightLabel, icon: Icon, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {(label || rightLabel) && (
        <div className="flex justify-between items-center mb-0.5">
          {label && (
            <label htmlFor={props.name} className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.08em]">
              {label}
            </label>
          )}
          {rightLabel && (
            <span className="text-[11px] text-[#253B95] font-bold hover:underline cursor-pointer">
              {rightLabel}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4.5 w-4.5 text-gray-400" strokeWidth={1.5} />
          </div>
        )}
        <input
          {...props}
          id={props.name}
          ref={ref}
          className={`
            block w-full pl-10 pr-4 py-3.5 
            bg-white border border-gray-200 
            rounded-xl text-gray-900 text-sm
            placeholder:text-gray-400
            focus:outline-none focus:ring-4 focus:ring-[#253B95]/5 focus:border-[#253B95]
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
