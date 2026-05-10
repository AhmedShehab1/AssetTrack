import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NotificationBell from '../../../components/layout/NotificationBell';
import { notificationService } from '../../../api/services/notifications';

// Mock the service
jest.mock('../../../api/services/notifications', () => ({
  notificationService: {
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  }
}));

describe('NotificationBell', () => {
  const mockNotifications = {
    content: [
      { id: '1', type: 'WARRANTY_EXPIRY', message: 'Warranty expiring', read: false, createdAt: new Date().toISOString() },
      { id: '2', type: 'LOW_STOCK', message: 'Low stock', read: true, createdAt: new Date().toISOString() }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.list.mockResolvedValue(mockNotifications);
    // Suppress console error for date-fns in tests if needed, 
    // but here we use real dates.
  });

  it('renders unread count badge', async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(notificationService.list).toHaveBeenCalled();
    });

    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  it('opens dropdown and marks as read', async () => {
    notificationService.markRead.mockResolvedValue({});
    
    render(<NotificationBell />);

    // Click bell to open
    const bellBtn = screen.getByRole('button');
    fireEvent.click(bellBtn);

    // Should see messages
    expect(await screen.findByText('Warranty expiring')).toBeInTheDocument();
    expect(screen.getByText('Low stock')).toBeInTheDocument();

    // Click unread notification
    const unreadItem = screen.getByText('Warranty expiring');
    fireEvent.click(unreadItem);

    await waitFor(() => {
      expect(notificationService.markRead).toHaveBeenCalledWith('1');
    });
  });

  it('marks all as read', async () => {
    notificationService.markAllRead.mockResolvedValue({});
    
    render(<NotificationBell />);

    fireEvent.click(screen.getByRole('button'));

    const markAllBtn = await screen.findByText(/Mark all as read/i);
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationService.markAllRead).toHaveBeenCalled();
    });
  });
});
