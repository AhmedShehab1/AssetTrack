import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['ADMIN', 'MANAGER', 'DEVELOPER'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await api.post('/auth/register', data);
      navigate('/login'); // Redirect to login on successful signup
    } catch (err) {
      setApiError(err.response?.data?.message || 'This email is already in use.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm border border-danger-expired/20">
          {apiError}
        </div>
      )}
      
      <Select
        label="ROLE"
        icon={Shield}
        options={[
          { value: '', label: 'Select a role...' },
          { value: 'ADMIN', label: 'Admin' },
          { value: 'MANAGER', label: 'Manager' },
          { value: 'DEVELOPER', label: 'Developer' }
        ]}
        {...register('role')}
        error={formState.errors.role?.message}
      />

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
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        {...register('password')}
        error={formState.errors.password?.message}
      />

      <Input
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        {...register('confirmPassword')}
        error={formState.errors.confirmPassword?.message}
      />

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignupForm;
