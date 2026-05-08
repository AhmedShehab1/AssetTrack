import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import Button from '../components/ui/Button';
import useAuthStore from '../store/useAuthStore';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleReturnToLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <AuthLayout
      title="Access denied"
      subtitle="You do not have permission to view this page."
    >
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border border-outline-variant/60 p-6 text-center">
        <p className="text-body-md text-text-body mb-6">
          Please contact your administrator if you believe this is an error.
        </p>
        <Button type="button" onClick={handleReturnToLogin}>
          Return to Login
        </Button>
      </div>
    </AuthLayout>
  );
};

export default UnauthorizedPage;
