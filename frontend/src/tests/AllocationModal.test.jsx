import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllocationModalContent from '../components/common/AllocationModalContent';
import { userService } from '../api/services';


// Mock the api instance
jest.mock('../api/services', () => ({
  userService: {
    list: jest.fn(),
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
    jest.clearAllMocks();
    userService.list.mockResolvedValue(mockUsers.data);
  });

  it('fetches users and allows selection', async () => {
    render(
      <AllocationModalContent 
        assetId={mockAsset.id} 
        assetName={mockAsset.name} 
        assetSN={mockAsset.sn} 
        onComplete={jest.fn()} 
      />
    );

    // Should fetch users on mount
    await waitFor(() => expect(userService.list).toHaveBeenCalledWith({ size: 100 }));

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
    const onComplete = jest.fn();
    

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
    

    // Should show success state
    expect(await screen.findByText('Allocation Successful!')).toBeInTheDocument();

    // Click Done
    fireEvent.click(screen.getByText('Done'));
    expect(onComplete).toHaveBeenCalled();
  });
});
