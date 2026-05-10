import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../../hooks/useAssetTrack';
import api from '../../lib/axios';
import Input from '../common/Input';
import Button from '../common/Button';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
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

  const { signup, error: apiError, clearError } = useSignup();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      password: data.password,
      fullName: `${data.firstName} ${data.lastName}`.trim(),
    };
    
    const result = await signup(payload);
    if (result) {
      navigate('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 font-medium">
          {apiError.message || 'Signup failed. Please try again.'}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="FIRST NAME"
          placeholder="Jane"
          icon={User}
          autoComplete="given-name"
          {...register('firstName')}
          error={formState.errors.firstName?.message}
          onFocus={clearError}
        />
        <Input
          label="LAST NAME"
          placeholder="Doe"
          icon={User}
          autoComplete="family-name"
          {...register('lastName')}
          error={formState.errors.lastName?.message}
          onFocus={clearError}
        />
      </div>

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
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        {...register('password')}
        error={formState.errors.password?.message}
        onFocus={clearError}
      />

      <Input
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        {...register('confirmPassword')}
        error={formState.errors.confirmPassword?.message}
        onFocus={clearError}
      />

      <Button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignupForm;
