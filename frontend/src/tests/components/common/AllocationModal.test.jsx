import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllocationModalContent from '../../../components/common/AllocationModalContent';
import { userService } from '../../../api/services';
import * as useAssetTrackModule from '../../../hooks/useAssetTrack';

// Mock the services
jest.mock('../../../api/services', () => ({
  userService: {
    list: jest.fn(),
  }
}));

// Mock the allocation hook
jest.mock('../../../hooks/useAssetTrack', () => ({
  ...jest.requireActual('../../../hooks/useAssetTrack'),
  useAllocateAsset: jest.fn()
}));

describe('AllocationModalContent', () => {
  const mockAsset = {
    id: 'a1',
    name: 'Test Laptop',
    sn: 'SN123'
  };

  const mockUsers = {
    content: [
      { id: 'u1', fullName: 'Jane Doe', role: 'DEVELOPER', email: 'jane@test.com' },
      { id: 'u2', fullName: 'John Smith', role: 'MANAGER', email: 'john@test.com' }
    ]
  };

  const mockAllocate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    userService.list.mockResolvedValue(mockUsers);
    useAssetTrackModule.useAllocateAsset.mockReturnValue({
      allocate: mockAllocate,
      loading: false,
      error: null,
      clearError: jest.fn()
    });
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
    const dropdown = screen.getByText('Search employees...');
    fireEvent.click(dropdown);

    const userOption = await screen.findByText('Jane Doe');
    fireEvent.click(userOption);

    // Update Assignment button should be enabled
    const updateButton = screen.getByText('Update Assignment');
    expect(updateButton).not.toBeDisabled();
  });

  it('submits allocation and calls onComplete on success', async () => {
    const onComplete = jest.fn();
    mockAllocate.mockResolvedValue({ id: 'alloc1' });

    render(
      <AllocationModalContent 
        assetId={mockAsset.id} 
        assetName={mockAsset.name} 
        assetSN={mockAsset.sn} 
        onComplete={onComplete} 
      />
    );

    // Select user
    fireEvent.click(screen.getByText('Search employees...'));
    const userOption = await screen.findByText('Jane Doe');
    fireEvent.click(userOption);

    // Click Update
    fireEvent.click(screen.getByText('Update Assignment'));

    // Should show confirmation step
    expect(screen.getByText(/Confirm Allocation/i)).toBeInTheDocument();

    // Confirm
    const confirmButton = screen.getByText('Confirm Reassignment');
    fireEvent.click(confirmButton);

    // Should call API
    await waitFor(() => expect(mockAllocate).toHaveBeenCalledWith(mockAsset.id, {
      assignedToUserId: 'u1',
      notes: undefined
    }));

    // Should show success state
    expect(await screen.findByText('Allocation Successful!')).toBeInTheDocument();

    // Click Done
    fireEvent.click(screen.getByText('Done'));
    expect(onComplete).toHaveBeenCalled();
  });
});
