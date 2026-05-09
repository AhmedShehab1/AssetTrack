import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError from '../errors/FormFieldError';
import { useSignup } from '../../hooks/useAssetTrack';
import Input from '../common/Input';
import Button from '../common/Button';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const signupSchema = z.object({
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
