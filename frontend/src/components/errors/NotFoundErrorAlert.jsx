import React from 'react';
import { SearchX, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

/**
 * Handles 404 Not Found errors.
 */
const NotFoundErrorAlert = ({ error }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 border border-outline-variant rounded-2xl p-8 font-sans animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col items-center text-center">
      <div className="bg-white p-4 rounded-full shadow-sm border border-outline-variant text-slate-400 mb-4">
        <SearchX size={32} />
      </div>
      <h4 className="text-lg font-black text-text-heading uppercase tracking-tight mb-2">Resource Not Found</h4>
      <p className="text-sm text-text-body font-medium opacity-70 leading-relaxed max-w-sm mb-6">
        {error?.message || "The specific record or page you are looking for could not be located on our servers."}
      </p>
      
      <Button 
        variant="outline" 
        icon={ArrowLeft} 
        onClick={() => navigate(-1)}
        className="bg-white"
      >
        Go Back
      </Button>
    </div>
  );
};

export default NotFoundErrorAlert;
