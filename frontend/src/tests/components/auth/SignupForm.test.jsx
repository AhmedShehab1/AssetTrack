import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import api from '../../../lib/axios';
import SignupForm from '../../../components/auth/SignupForm';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../../../lib/axios', () => ({
  post: jest.fn(),
}));

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<SignupForm />);
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
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('submits successfully and calls api', async () => {
    api.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    render(<SignupForm />);
    
    await userEvent.type(screen.getByLabelText(/WORK EMAIL/i), 'test@company.com');
    await userEvent.type(screen.getByLabelText(/^PASSWORD$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/CONFIRM PASSWORD/i), 'Password123');

    const button = screen.getByRole('button', { name: /Sign Up/i });

    await userEvent.click(button);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@company.com',
        password: 'Password123',
      });
    });
  });

  it('displays API error message on failure', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'This email is already in use.' } },
    });

    render(<SignupForm />);
    
    await userEvent.type(screen.getByLabelText(/WORK EMAIL/i), 'test@company.com');
    await userEvent.type(screen.getByLabelText(/^PASSWORD$/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/CONFIRM PASSWORD/i), 'Password123');
    fireEvent.blur(screen.getByLabelText(/CONFIRM PASSWORD/i));

    const button = screen.getByRole('button', { name: /Sign Up/i });

    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('This email is already in use.')).toBeInTheDocument();
    });
  });
});
