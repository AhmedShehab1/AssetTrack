import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AllocationModalContent from '../../../components/common/AllocationModalContent';
import { userService } from '../../../api/services/users';
import { allocationService } from '../../../api/services/allocations';
import * as useAllocations from '../../../hooks/api/useAllocations';

// Mock services
jest.mock('../../../api/services/users');
jest.mock('../../../api/services/allocations');
jest.mock('../../../hooks/api/useAllocations');

const mockUsers = {
  content: [
    { id: 'u1', fullName: 'Alice Admin', email: 'alice@test.com', role: 'ADMIN' },
    { id: 'u2', fullName: 'Bob Manager', email: 'bob@test.com', role: 'MANAGER' },
  ],
  meta: { totalElements: 2, totalPages: 1 }
};

const mockHistory = {
  content: [
    { id: 'h1', assignedTo: { fullName: 'Charlie Dev' }, allocatedAt: '2024-01-01', deallocatedAt: '2024-02-01' }
  ],
  meta: { totalElements: 1, totalPages: 1 }
};

describe('AllocationModalContent', () => {
  const mockOnComplete = jest.fn();
  const mockAllocate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    userService.list.mockResolvedValue(mockUsers);
    allocationService.history.mockResolvedValue(mockHistory);
    useAllocations.useAllocateAsset.mockReturnValue({
      allocate: mockAllocate,
      loading: false,
      error: null
    });
  });

  it('renders correctly and loads data', async () => {
    render(
      <AllocationModalContent 
        assetId="a1" 
        assetName="MacBook Pro" 
        assetSN="SN123" 
        onComplete={mockOnComplete} 
      />
    );

    expect(screen.getByText('Recent Allocation History')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
      expect(screen.getByText('Charlie Dev')).toBeInTheDocument();
    });
  });

  it('handles the allocation flow', async () => {
    mockAllocate.mockResolvedValue(true);
    
    render(
      <AllocationModalContent 
        assetId="a1" 
        assetName="MacBook Pro" 
        assetSN="SN123" 
        onComplete={mockOnComplete} 
      />
    );

    // Select a user
    const dropdown = screen.getByPlaceholderText('Search employees...');
    fireEvent.change(dropdown, { target: { value: 'Alice' } });
    
    await waitFor(() => {
      const option = screen.getByText('Alice Admin');
      fireEvent.click(option);
    });

    // Confirm Allocation button should be enabled
    const confirmBtn = screen.getByText('Confirm Allocation');
    fireEvent.click(confirmBtn);

    // Confirmation step
    expect(screen.getByText('Confirm Reallocation')).toBeInTheDocument();
    const finalBtn = screen.getByText('Confirm Reallocation');
    fireEvent.click(finalBtn);

    await waitFor(() => {
      expect(mockAllocate).toHaveBeenCalledWith('a1', {
        assignedToUserId: 'u1',
        notes: undefined
      });
      expect(screen.getByText('Allocation Successful!')).toBeInTheDocument();
    });
  });
});
