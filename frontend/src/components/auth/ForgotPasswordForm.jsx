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
      <div className="text-center space-y-6">
        <div 
          className="border border-[#28A745]/20 p-4 rounded-xl"
          style={{ backgroundColor: 'var(--success-bg, #d4edda)', color: 'var(--success, #155724)' }}
        >
          <p className="font-medium text-sm">
            Reset link sent! Please check your email for instructions to reset your password.
          </p>
        </div>
        <Link 
          to="/login" 
          className="inline-flex items-center text-[#253B95] font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-gray-500 text-sm text-center mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {apiError && (
        <div className="bg-error-container text-on-error-container p-3 rounded-md text-sm border border-danger-expired/20">
          {apiError.message || 'An error occurred. Please try again.'}
        </div>
      )}
      
      <Input
        label="WORK EMAIL"
        type="email"
        placeholder="name@company.com"
        icon={Mail}
        {...register('email')}
        error={formState.errors.email?.message}
        onFocus={clearError}
      />

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>
      
      <div className="flex justify-center">
        <Link 
          to="/login" 
          className="flex items-center text-sm text-gray-500 hover:text-[#253B95] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
