import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

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

  const [apiError, setApiError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const response = await api.post('/auth/login', data);
      const { token, role } = response.data;
      login({ email: data.email, role }, token);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm border border-danger-expired/20">
          {apiError}
        </div>
      )}
      <Input
        label="WORK EMAIL"
        type="email"
        placeholder="name@company.com"
        icon={Mail}
        {...register('email')}
        error={formState.errors.email?.message}
      />
      
      <Input
        label="PASSWORD"
        rightLabel="Forgot Password?"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        {...register('password')}
        error={formState.errors.password?.message}
      />

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
