import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError from '../errors/FormFieldError';
import { useSignup } from '../../hooks/useAssetTrack';
import Input from '../ui/Input';
import Button from '../ui/Button';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
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

  const { signup, loading, error, clearError } = useSignup();
  const navigate = useNavigate();

  const hasFieldErrors = Array.isArray(error?.fieldErrors) && error.fieldErrors.length > 0;

  const onSubmit = async (data) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    };
    const response = await signup(payload);
    if (response) {
      navigate('/login'); // Redirect to login on successful signup
=======
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
>>>>>>> origin/Implement-AllocationModal-for-Asset-Assignment-#15
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && !hasFieldErrors && (
        <GlobalErrorAlert error={error} onDismiss={clearError} />
      )}

<<<<<<< HEAD
      <Input
        label="FULL NAME"
        type="text"
        placeholder="Jane Doe"
        autoComplete="name"
        {...register('fullName')}
        error={formState.errors.fullName?.message}
      />
      <FormFieldError id="fullName-error" fieldName="fullName" fieldErrors={error?.fieldErrors} />
      
      <Input
        label="WORK EMAIL"
        type="email"
        placeholder="name@company.com"
        onFocus={() => error && clearError()}
        icon={Mail}
        {...register('email')}
        error={formState.errors.email?.message}
      />
      <FormFieldError id="email-error" fieldName="email" fieldErrors={error?.fieldErrors} />
      
      <Input
        label="PASSWORD"
        type="password"
        placeholder="••••••••"
        onFocus={() => error && clearError()}
        icon={Lock}
        autoComplete="new-password"
        {...register('password')}
        error={formState.errors.password?.message}
      />
      <FormFieldError id="password-error" fieldName="password" fieldErrors={error?.fieldErrors} />

      <Input
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        {...register('confirmPassword')}
        error={formState.errors.confirmPassword?.message}
      />

      <Button type="submit" disabled={formState.isSubmitting || loading}>
        {formState.isSubmitting || loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignupForm;
