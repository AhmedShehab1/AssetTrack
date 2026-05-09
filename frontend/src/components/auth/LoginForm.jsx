import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError from '../errors/FormFieldError';
import { useLogin } from '../../hooks/useAssetTrack';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

const loginSchema = z.object({
  email: z.string().regex(/^\S+@\S+\.\S+$/, 'Please enter a valid email address'),
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

  const { login: submitLogin, loading, error, clearError } = useLogin();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const response = await submitLogin(data);
    if (response) {
      const user = response.user ?? {
        email: data.email,
        role: response.role,
      };
      login(user, response.accessToken);
      navigate('/');
    }
  };

  const hasFieldErrors = Array.isArray(error?.fieldErrors) && error.fieldErrors.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && !hasFieldErrors && (
        <GlobalErrorAlert error={error} onDismiss={clearError} />
      )}
      <Input
        label="WORK EMAIL"
        type="email"
        placeholder="name@company.com"
        icon={Mail}
        onFocus={() => error && clearError()}
        {...register('email')}
        error={formState.errors.email?.message}
      />
      <FormFieldError
        id="email-error"
        fieldName="email"
        fieldErrors={error?.fieldErrors}
      />
      
      <Input
        label="PASSWORD"
        rightLabel="Forgot Password?"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        onFocus={() => error && clearError()}
        {...register('password')}
        error={formState.errors.password?.message}
      />
      <FormFieldError
        id="password-error"
        fieldName="password"
        fieldErrors={error?.fieldErrors}
      />

      <Button type="submit" disabled={formState.isSubmitting || loading}>
        {formState.isSubmitting || loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
