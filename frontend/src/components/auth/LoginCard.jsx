import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';

const LoginCard = () => {
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-outline-variant/60 overflow-hidden">
      <div className="p-6 sm:p-10 pb-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-primary rounded-xl p-2.5 mb-4 shadow-sm">
            <Package className="h-7 w-7 text-on-primary" />
          </div>
          <h1 className="text-display-sm text-primary font-bold tracking-tight">AssetTrack</h1>
          <p className="text-body-md text-text-body mt-1.5">
            Enterprise Asset Management
          </p>
        </div>
        
        <LoginForm />
      </div>
      
      <div className="border-t border-outline-variant/60 bg-surface-container-lowest p-5 flex justify-center items-center">
        <p className="text-body-sm text-text-heading">
          Need access to the system? <Link to="/signup" className="text-primary font-bold hover:text-primary-fixed-variant transition-colors ml-1">Request Access</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
