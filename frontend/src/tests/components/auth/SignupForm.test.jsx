import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '../../../components/auth/SignupForm';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
const mockSignup = jest.fn();
const mockClearError = jest.fn();

let mockUseSignupState;

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../hooks/useAssetTrack', () => ({
  useSignup: () => mockUseSignupState,
}));

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSignupState = {
      signup: mockSignup,
      loading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  it('renders correctly', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/FULL NAME/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WORK EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^PASSWORD$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CONFIRM PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(<SignupForm />);
    const button = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('submits successfully and calls api', async () => {
    mockSignup.mockResolvedValueOnce({
      email: 'test@company.com',
      role: 'DEVELOPER',
    });

    render(<SignupForm />);
    
    await userEvent.type(screen.getByLabelText(/FULL NAME/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/WORK EMAIL/i), 'test@company.com');
    await userEvent.type(screen.getByLabelText(/^PASSWORD$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/CONFIRM PASSWORD/i), 'Password123');

    const button = screen.getByRole('button', { name: /Sign Up/i });

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        fullName: 'Jane Doe',
        email: 'test@company.com',
        password: 'Password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows a global API error banner on registration failure', () => {
    mockUseSignupState.error = {
      status: 409,
      message: 'This email is already in use.',
      error: 'Conflict',
      timestamp: '2026-05-08T00:00:00Z',
      path: '/auth/signup',
      fieldErrors: [],
    };

    render(<SignupForm />);

    expect(screen.getByText('This email is already in use.')).toBeInTheDocument();
  });

  it('shows backend field errors beneath matching inputs', () => {
    mockUseSignupState.error = {
      status: 400,
      message: 'Validation failed',
      error: 'Bad Request',
      timestamp: '2026-05-08T00:00:00Z',
      path: '/auth/signup',
      fieldErrors: [
        { field: 'fullName', message: 'Full name is required' },
        { field: 'email', message: 'Email is invalid' },
        { field: 'password', message: 'Password must contain a number' },
      ],
    };

    render(<SignupForm />);
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Password must contain a number')).toBeInTheDocument();
  });
});
