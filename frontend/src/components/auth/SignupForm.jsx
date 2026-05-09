import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import Input from '../ui/Input';
import Button from '../ui/Button';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .regex(
      PASSWORD_PATTERN,
      'Password must be at least 8 characters, contain uppercase, lowercase, and a number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
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
      const payload = {
        email: data.email,
        password: data.password,
      };
      await api.post('/auth/register', payload);
      navigate('/login'); // Redirect to login on successful signup
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm border border-danger-expired/20">
          {apiError}
        </div>
      )}

      <div className="flex gap-4">
        <Input
          label="FIRST NAME"
          placeholder="Jane"
          icon={User}
          {...register('firstName')}
          error={formState.errors.firstName?.message}
        />
        <Input
          label="LAST NAME"
          placeholder="Doe"
          icon={User}
          {...register('lastName')}
          error={formState.errors.lastName?.message}
        />
      </div>
      
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
