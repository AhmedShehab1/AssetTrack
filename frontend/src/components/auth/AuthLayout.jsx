const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#F5F7FB] relative overflow-hidden font-sans">
      {/* Subtle light effect in the background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,1)_0%,_rgba(245,247,251,0)_100%)] pointer-events-none"></div>
      
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
