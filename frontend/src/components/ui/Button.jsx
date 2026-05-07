
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "w-full py-2.5 px-4 rounded-md font-semibold transition-colors duration-200 flex justify-center items-center text-body-lg";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-fixed-variant",
    secondary: "bg-surface-variant text-on-surface-variant hover:bg-outline-variant",
    outline: "border-2 border-primary text-primary hover:bg-primary/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
