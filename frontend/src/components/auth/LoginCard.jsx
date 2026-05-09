import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginForm from './LoginForm';

const LoginCard = () => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
      <div className="p-8 sm:p-12 pb-10">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="bg-[#3F51B5] rounded-2xl p-4 mb-6 shadow-lg shadow-[#3F51B5]/20">
            <Package className="h-9 w-9 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-[#1A237E] tracking-tight font-heading">AssetTrack</h1>
          <p className="text-gray-400 text-sm mt-3 font-medium tracking-wide">
            Enterprise Asset Management
          </p>
        </div>
        
        <LoginForm />
      </div>
      
      <div className="border-t border-gray-100 bg-[#FAFBFE] p-6 flex justify-center items-center">
        <p className="text-sm text-gray-400 font-medium">
          Need access to the system? <Link to="/signup" className="text-[#253B95] font-bold hover:underline ml-1">Request Access</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
