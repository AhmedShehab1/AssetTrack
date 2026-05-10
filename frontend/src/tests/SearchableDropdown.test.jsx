import { render, screen, fireEvent } from '@testing-library/react';
import SearchableDropdown from '../components/common/SearchableDropdown';


describe('SearchableDropdown', () => {
  const mockOptions = [
    { id: 1, name: 'Apple', role: 'Brand' },
    { id: 2, name: 'Dell', role: 'Brand' }
  ];

  it('renders with placeholder text', () => {
    const onSelect = jest.fn();
    render(
      <SearchableDropdown 
        label="Test" 
        placeholder="Search user..."
        options={mockOptions} 
        onSelect={onSelect} 
      />
    );

    // Verify placeholder is rendered
    expect(screen.getByText('Search user...')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    const onSelect = jest.fn();
    render(
      <SearchableDropdown 
        label="Test" 
        placeholder="Search user..."
        options={mockOptions} 
        onSelect={onSelect} 
      />
    );

    // Click to open dropdown
    fireEvent.click(screen.getByText('Search user...'));

    // Verify filter input is visible
    const input = screen.getByPlaceholderText('Filter users...');
    expect(input).toBeInTheDocument();
  });

  it('filters options based on search input', () => {
    const onSelect = jest.fn();
    render(
      <SearchableDropdown 
        label="Test" 
        placeholder="Search user..."
        options={mockOptions} 
        onSelect={onSelect} 
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Search user...'));

    // Find and type in filter input
    const input = screen.getByPlaceholderText('Filter users...');
    fireEvent.change(input, { target: { value: 'ap' } });

    // Verify only Apple option is shown
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Dell')).not.toBeInTheDocument();
  });

  it('calls onSelect when option is clicked', () => {
    const onSelect = jest.fn();
    render(
      <SearchableDropdown 
        label="Test" 
        placeholder="Search user..."
        options={mockOptions} 
        onSelect={onSelect} 
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByText('Search user...'));

    // Click on first option
    fireEvent.click(screen.getByText('Apple'));

    // Verify onSelect was called with correct option
    expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
  });
});
