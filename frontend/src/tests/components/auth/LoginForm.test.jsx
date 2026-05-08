import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../../components/auth/LoginForm';
import '@testing-library/jest-dom';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();
const mockSubmitLogin = jest.fn();
const mockClearError = jest.fn();

let mockUseLoginState;

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin })
}));

jest.mock('../../../hooks/useAssetTrack', () => ({
  useLogin: () => mockUseLoginState,
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLoginState = {
      login: mockSubmitLogin,
      loading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  it('renders correctly', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/WORK EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(<LoginForm />);
    const button = screen.getByRole('button', { name: /Sign In/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid email', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/WORK EMAIL/i);
    
    await userEvent.type(emailInput, 'invalidemail');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits successfully and calls api', async () => {
    mockSubmitLogin.mockResolvedValueOnce({
      accessToken: '123',
      role: 'DEVELOPER',
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/WORK EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);
    const button = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'test@company.com');
    await userEvent.type(passwordInput, 'password123');

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockSubmitLogin).toHaveBeenCalledWith({
        email: 'test@company.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith(
        { email: 'test@company.com', role: 'DEVELOPER' },
        '123'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows a global API error banner for login failures', () => {
    mockUseLoginState.error = {
      status: 401,
      message: 'Invalid email or password.',
      error: 'Unauthorized',
      timestamp: '2026-05-08T00:00:00Z',
      path: '/auth/login',
      fieldErrors: [],
    };

    render(<LoginForm />);
    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('shows backend field errors beneath the matching inputs', () => {
    mockUseLoginState.error = {
      status: 400,
      message: 'Validation failed',
      error: 'Bad Request',
      timestamp: '2026-05-08T00:00:00Z',
      path: '/auth/login',
      fieldErrors: [
        { field: 'email', message: 'Email is invalid' },
        { field: 'password', message: 'Password is required' },
      ],
    };

    render(<LoginForm />);
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
