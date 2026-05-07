
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface-card rounded-xl shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;
