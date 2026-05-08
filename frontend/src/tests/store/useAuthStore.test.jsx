import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import useAuthStore from '../../../store/useAuthStore';
import { useAuth } from '../../../hooks/useAuth';

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <div data-testid="user">{user?.email || 'No User'}</div>
      <button onClick={() => login({ email: 'test@example.com', role: 'admin' }, 'fake-token')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('Auth Store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('updates store and triggers re-render in consuming components', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('status')).toHaveTextContent('Logged Out');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    
    fireEvent.click(screen.getByText('Login'));
    
    expect(screen.getByTestId('status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('initializes state from localStorage on app startup', () => {
    const authData = {
      state: {
        user: { email: 'persisted@example.com', role: 'user' },
        token: 'persisted-token',
        isAuthenticated: true
      },
      version: 0
    };
    window.localStorage.setItem('auth-storage', JSON.stringify(authData));
    
    useAuthStore.persist.rehydrate();
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user')).toHaveTextContent('persisted@example.com');
  });
});
