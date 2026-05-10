import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { useForgotPassword } from '../../hooks/useAssetTrack';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword, error: apiError, clearError } = useForgotPassword();

  const onSubmit = async (data) => {
    const result = await forgotPassword(data);
    // Even if it fails with 404 (because backend doesn't have it), 
    // we might want to show success to prevent email enumeration,
    // but here we'll check if result is successful.
    // If backend doesn't have it, result will be undefined.
    if (result !== undefined) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-8">
        <div className="bg-success-bg text-success border border-success/10 p-5 rounded-2xl">
          <p className="font-bold text-sm leading-relaxed">
            Reset link sent! Please check your email for instructions to reset your password.
          </p>
        </div>
        <Link 
          to="/login" 
          className="inline-flex items-center text-primary font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-text-body text-sm text-center mb-6 leading-relaxed">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {apiError && (
        <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm border border-danger/10">
          {apiError.message || 'An error occurred. Please try again.'}
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

      <Button type="submit" className="w-full py-4 shadow-xl" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>
      
      <div className="flex justify-center pt-2">
        <Link 
          to="/login" 
          className="flex items-center text-sm font-bold text-text-body hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
