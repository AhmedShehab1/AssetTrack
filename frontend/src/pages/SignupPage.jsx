import SignupCard from '../components/auth/SignupCard';
import AuthLayout from '../components/auth/AuthLayout';

const SignupPage = () => {
  return (
    <AuthLayout
      title="Join your team and get started today."
      subtitle="Set up your account to start managing assets with absolute precision and ease."
    >
      <SignupCard />
    </AuthLayout>
  );
};

export default SignupPage;
