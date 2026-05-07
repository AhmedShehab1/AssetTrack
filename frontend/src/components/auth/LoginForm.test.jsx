import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import LoginForm from './LoginForm';
import '@testing-library/jest-dom';

jest.mock('axios');

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('submits successfully and calls axios', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: '123' } });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/WORK EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);
    const button = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'test@company.com');
    await userEvent.type(passwordInput, 'password123');



    await userEvent.click(button);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@company.com',
        password: 'password123',
      });
    });
  });

  it('displays API error message on failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Custom API Error' } },
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/WORK EMAIL/i);
    const passwordInput = screen.getByLabelText(/PASSWORD/i);
    const button = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'test@company.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Custom API Error')).toBeInTheDocument();
    });
  });
});
