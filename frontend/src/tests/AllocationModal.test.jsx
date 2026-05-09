import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllocationModalContent from '../components/common/AllocationModalContent';
import api from '../lib/axios';
import { vi } from 'vitest';

// Mock the api instance
vi.mock('../lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('AllocationModalContent', () => {
  const mockAsset = {
    id: 1,
    name: 'Test Laptop',
    sn: 'SN123'
  };

  const mockUsers = {
    data: {
      content: [
        { id: 'u1', fullName: 'Jane Doe', role: 'Developer', email: 'jane@test.com' },
        { id: 'u2', fullName: 'John Smith', role: 'Manager', email: 'john@test.com' }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockUsers);
  });

  it('fetches users and allows selection', async () => {
    render(
      <AllocationModalContent 
        assetId={mockAsset.id} 
        assetName={mockAsset.name} 
        assetSN={mockAsset.sn} 
        onComplete={vi.fn()} 
      />
    );

    // Should fetch users on mount
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/users', expect.anything()));

    // Open dropdown and select user
    const dropdown = screen.getByText('Search user...');
    fireEvent.click(dropdown);

    const userOption = await screen.findByText('Jane Doe');
    fireEvent.click(userOption);

    // Update Asset button should be enabled
    const updateButton = screen.getByText('Update Asset');
    expect(updateButton).not.toBeDisabled();
  });

  it('submits allocation and calls onComplete on success', async () => {
    const onComplete = vi.fn();
    api.post.mockResolvedValue({ data: { success: true } });

    render(
      <AllocationModalContent 
        assetId={mockAsset.id} 
        assetName={mockAsset.name} 
        assetSN={mockAsset.sn} 
        onComplete={onComplete} 
      />
    );

    // Select user
    fireEvent.click(screen.getByText('Search user...'));
    const userOption = await screen.findByText('Jane Doe');
    fireEvent.click(userOption);

    // Click Update
    fireEvent.click(screen.getByText('Update Asset'));

    // Should show confirmation step
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

    // Confirm
    const confirmButton = screen.getByText('Confirm Reassignment');
    fireEvent.click(confirmButton);

    // Should call API
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      `/assets/${mockAsset.id}/allocate`, 
      { userId: 'u1' }
    ));

    // Should show success state
    expect(await screen.findByText('Allocation Successful!')).toBeInTheDocument();

    // Click Done
    fireEvent.click(screen.getByText('Done'));
    expect(onComplete).toHaveBeenCalled();
  });
});
