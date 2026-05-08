const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-blue-50 via-surface-page to-blue-50/50 relative overflow-hidden font-sans">
      {/* Subtle decorative background elements to match the soft vibe of the screenshot */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none"></div>
      
      {/* The centered interactive container */}
      <div className="w-full max-w-[440px] relative z-10">
        {(title || subtitle) && (
          <div className="mb-6 text-center">
            {title && (
              <h2 className="text-headline-md text-text-heading font-semibold">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-body-md text-text-body mt-2">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
