import LoginCard from '../components/auth/LoginCard';
import AuthLayout from '../components/auth/AuthLayout';

const LoginPage = () => {
  return (
    <AuthLayout
      title="Manage all your enterprise assets in one place."
      subtitle="The ultimate solution for tracking, assigning, and maintaining your organization's physical and digital assets."
    >
      <LoginCard />
    </AuthLayout>
  );
};

export default LoginPage;
