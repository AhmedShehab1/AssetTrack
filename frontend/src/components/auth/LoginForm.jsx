import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAssetTrack';
import Input from '../common/Input';
import Button from '../common/Button';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const { login, error: apiError, clearError } = useLogin();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result) {
      // Role-based redirection
      if (result.user?.role === 'DEVELOPER') {
        navigate('/assets');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 font-medium">
          {apiError.message || 'Invalid email or password.'}
        </div>
      )}
      <Input
        label="WORK EMAIL"
        type="email"
        placeholder="name@company.com"
        icon={Mail}
        autoComplete="email"
        {...register('email')}
        error={formState.errors.email?.message}
        onFocus={clearError}
      />
      
      <Input
        label="PASSWORD"
        rightLabel={<Link to="/forgot-password">Forgot Password?</Link>}
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="current-password"
        {...register('password')}
        error={formState.errors.password?.message}
        onFocus={clearError}
      />

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
