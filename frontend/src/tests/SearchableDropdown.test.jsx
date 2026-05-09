import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchableDropdown from '../components/common/SearchableDropdown';


describe('SearchableDropdown', () => {
  const mockOptions = [
    { id: 1, name: 'Apple', role: 'Brand' },
    { id: 2, name: 'Dell', role: 'Brand' }
  ];

  it('calls onSearch after delay when typing', async () => {
    const onSearch = jest.fn();
    render(
      <SearchableDropdown 
        label="Test" 
        options={mockOptions} 
        onSearch={onSearch} 
        onSelect={jest.fn()} 
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Search user...'));

    const input = screen.getByPlaceholderText('Filter users...');
    fireEvent.change(input, { target: { value: 'ap' } });

    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled();

    // Should call after debounce
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('ap'), { timeout: 500 });
  });

  it('displays loading state', () => {
    render(
      <SearchableDropdown 
        label="Test" 
        options={[]} 
        loading={true} 
        onSelect={jest.fn()} 
      />
    );
    // Search icon is replaced by Loader2 which has a specific class or can be found by aria-label if added
    // For now we check that Search icon is NOT there or Loader is there.
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
