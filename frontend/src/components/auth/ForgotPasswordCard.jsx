import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from './ForgotPasswordForm';

const ForgotPasswordCard = () => {
  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-outline-variant/50 overflow-hidden">
      <div className="p-8 sm:p-14 pb-12">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="bg-primary rounded-2xl p-4 mb-6 shadow-lg shadow-primary/20">
            <Package className="h-9 w-9 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-text-heading tracking-tight">Reset Password</h1>
          <p className="text-text-body text-sm mt-3 font-medium tracking-wide text-center max-w-[240px]">
            Enter your credentials to recover your account
          </p>
        </div>
        
        <ForgotPasswordForm />
      </div>
      
      <div className="border-t border-outline-variant bg-slate-50 p-7 flex justify-center items-center">
        <p className="text-sm text-text-body font-bold">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline ml-1">Request Access</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordCard;
