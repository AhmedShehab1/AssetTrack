import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import SignupForm from './SignupForm';

const SignupCard = () => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
      <div className="p-8 sm:p-12 pb-10">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="bg-[#3F51B5] rounded-xl p-3 mb-6 shadow-md">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A237E] tracking-tight">AssetTrack</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Create a new account
          </p>
        </div>
        
        <SignupForm />
      </div>
      
      <div className="border-t border-gray-50 bg-white p-6 flex justify-center items-center">
        <p className="text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-[#3F51B5] font-semibold hover:underline ml-1">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupCard;
