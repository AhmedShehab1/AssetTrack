/**
 * @fileoverview
 * AssetRegistrationForm.test.jsx — Tests for asset registration with error boundaries.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AssetRegistrationForm from '../../../components/assets/AssetRegistrationForm';
import * as useAssetTrackModule from '../../../hooks/useAssetTrack';

jest.mock('../../../hooks/useAssetTrack');

describe('AssetRegistrationForm', () => {
  const mockCreateAsset = jest.fn();
  const mockClearError = jest.fn();

  const defaultState = {
    createAsset: mockCreateAsset,
    loading: false,
    error: null,
    clearError: mockClearError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAssetTrackModule.useCreateAsset.mockReturnValue(defaultState);
  });

  describe('Render', () => {
    it('should render the form with all required fields', () => {
      render(<AssetRegistrationForm />);

      // Headings
      expect(screen.getByText('Register New Hardware')).toBeInTheDocument();
      expect(screen.getByText('Identity & Classification')).toBeInTheDocument();
      expect(screen.getByText('Lifecycle & Warranty')).toBeInTheDocument();
      expect(screen.getByText(/CONDITION NOTES/i)).toBeInTheDocument();

      // Form fields
      expect(screen.getByLabelText(/ASSET TYPE/)).toBeInTheDocument();
      expect(screen.getByLabelText(/BRAND/)).toBeInTheDocument();
      expect(screen.getByLabelText(/MODEL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/SERIAL NUMBER/)).toBeInTheDocument();
      expect(screen.getByLabelText(/PURCHASE DATE/)).toBeInTheDocument();
      expect(screen.getByLabelText(/WARRANTY EXPIRATION/)).toBeInTheDocument();
      expect(screen.getByLabelText(/CONDITION NOTES/i)).toBeInTheDocument();

      // Buttons
      expect(screen.getByRole('button', { name: /Register Asset/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });

    it('should have all inputs with correct initial values', () => {
      render(<AssetRegistrationForm />);

      const typeSelect = screen.getByLabelText(/ASSET TYPE/);
      const brandInput = screen.getByLabelText(/BRAND/);
      const modelInput = screen.getByLabelText(/MODEL/);
      const serialInput = screen.getByLabelText(/SERIAL NUMBER/);
      const purchaseInput = screen.getByLabelText(/PURCHASE DATE/);
      const warrantyInput = screen.getByLabelText(/WARRANTY EXPIRATION/);
      const notesInput = screen.getByLabelText(/CONDITION NOTES/i);

      expect(typeSelect.value).toBe('');
      expect(brandInput.value).toBe('');
      expect(modelInput.value).toBe('');
      expect(serialInput.value).toBe('');
      expect(purchaseInput.value).toBe('');
      expect(warrantyInput.value).toBe('');
      expect(notesInput.value).toBe('');
    });

    it('should render asset type options from AssetType enum', () => {
      render(<AssetRegistrationForm />);

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(1); // At least "Select Category..." + enums
      expect(screen.getByText('LAPTOP')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should update form state on input change', async () => {
      render(<AssetRegistrationForm />);

      const typeSelect = screen.getByLabelText(/ASSET TYPE/);
      const brandInput = screen.getByLabelText(/BRAND/);

      fireEvent.change(typeSelect, { target: { value: 'LAPTOP' } });
      fireEvent.change(brandInput, { target: { value: 'Dell' } });

      await waitFor(() => {
        expect(typeSelect.value).toBe('LAPTOP');
        expect(brandInput.value).toBe('Dell');
      });
    });

    it('should clear error state on focus', async () => {
      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: { status: 400, message: 'Validation error' },
      });

      render(<AssetRegistrationForm />);

      const typeSelect = screen.getByLabelText(/ASSET TYPE/);
      fireEvent.focus(typeSelect);

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('should reset form state when Cancel button is clicked', async () => {
      render(<AssetRegistrationForm />);

      const brandInput = screen.getByLabelText(/BRAND/);
      const cancelButton = screen.getByRole('button', { name: /Cancel/ });

      fireEvent.change(brandInput, { target: { value: 'Dell' } });
      expect(brandInput.value).toBe('Dell');

      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(brandInput.value).toBe('');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display GlobalErrorAlert for 409 (duplicate serial) errors', async () => {
      const conflictError = {
        status: 409,
        message: 'Asset with serial number DL-XPS15-001 already exists',
        fieldErrors: [],
      };

      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: conflictError,
      });

      render(<AssetRegistrationForm />);

      expect(screen.getByText(/Asset with serial number DL-XPS15-001 already exists/)).toBeInTheDocument();
    });

    it('should display field-level errors beneath each input', async () => {
      const validationError = {
        status: 400,
        message: 'Validation failed',
        fieldErrors: [
          {
            field: 'serialNumber',
            rejectedValue: 'invalid!@#',
            message: String.raw`must match '^[A-Z0-9\-]{4,30}$'`,
          },
          {
            field: 'brand',
            rejectedValue: '',
            message: 'must not be blank',
          },
        ],
      };

      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: validationError,
      });

      render(<AssetRegistrationForm />);

      // Should display validation banner
      expect(screen.getByText(/Please correct the highlighted errors in the form/)).toBeInTheDocument();
    });

    it('should clear error message when user starts editing after error', async () => {
      const validationError = {
        status: 400,
        message: 'Validation failed',
        fieldErrors: [
          {
            field: 'brand',
            rejectedValue: '',
            message: 'must not be blank',
          },
        ],
      };

      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: validationError,
      });

      const { rerender } = render(<AssetRegistrationForm />);

      // Initially error is shown
      expect(screen.getByText(/Validation failed/)).toBeInTheDocument();

      // User focuses on an input
      const brandInput = screen.getByLabelText(/BRAND/);
      fireEvent.focus(brandInput);

      // clearError should be called
      expect(mockClearError).toHaveBeenCalled();

      // Simulate error being cleared
      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: null,
      });

      rerender(<AssetRegistrationForm />);

      expect(screen.queryByText(/Validation failed/)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call createAsset with form data on submit', async () => {
      mockCreateAsset.mockResolvedValue({
        id: '123',
        type: 'LAPTOP',
        brand: 'Dell',
        model: 'XPS 15',
        serialNumber: 'DL-XPS15-20240512',
        purchaseDate: '2024-05-12',
        warrantyExpirationDate: '2027-05-12',
        notes: 'New hire device',
      });

      render(<AssetRegistrationForm />);

      fireEvent.change(screen.getByLabelText(/ASSET TYPE/), { target: { value: 'LAPTOP' } });
      fireEvent.change(screen.getByLabelText(/BRAND/), { target: { value: 'Dell' } });
      fireEvent.change(screen.getByLabelText(/MODEL/), { target: { value: 'XPS 15' } });
      fireEvent.change(screen.getByLabelText(/SERIAL NUMBER/), { target: { value: 'DL-XPS15-20240512' } });
      fireEvent.change(screen.getByLabelText(/PURCHASE DATE/), { target: { value: '2024-05-12' } });
      fireEvent.change(screen.getByLabelText(/WARRANTY EXPIRATION/), { target: { value: '2027-05-12' } });
      fireEvent.change(screen.getByLabelText(/CONDITION NOTES/i), { target: { value: 'New hire device' } });

      const submitButton = screen.getByRole('button', { name: /Register Asset/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateAsset).toHaveBeenCalledWith({
          type: 'LAPTOP',
          brand: 'Dell',
          model: 'XPS 15',
          serialNumber: 'DL-XPS15-20240512',
          purchaseDate: '2024-05-12',
          warrantyExpirationDate: '2027-05-12',
          notes: 'New hire device',
        });
      });
    });

    it('should call onSuccess with asset data after successful submission', async () => {
      const mockOnSuccess = jest.fn();
      const assetData = {
        id: '123',
        type: 'LAPTOP',
        brand: 'Dell',
        model: 'XPS 15',
        serialNumber: 'DL-XPS15-20240512',
        purchaseDate: '2024-05-12',
        warrantyExpirationDate: '2027-05-12',
        notes: 'New hire device',
      };

      mockCreateAsset.mockResolvedValue(assetData);

      render(<AssetRegistrationForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText(/ASSET TYPE/), { target: { value: 'LAPTOP' } });
      fireEvent.change(screen.getByLabelText(/BRAND/), { target: { value: 'Dell' } });
      fireEvent.change(screen.getByLabelText(/MODEL/), { target: { value: 'XPS 15' } });
      fireEvent.change(screen.getByLabelText(/SERIAL NUMBER/), { target: { value: 'DL-XPS15-20240512' } });
      fireEvent.change(screen.getByLabelText(/PURCHASE DATE/), { target: { value: '2024-05-12' } });
      fireEvent.change(screen.getByLabelText(/WARRANTY EXPIRATION/), { target: { value: '2027-05-12' } });
      fireEvent.change(screen.getByLabelText(/CONDITION NOTES/i), { target: { value: 'New hire device' } });

      fireEvent.click(screen.getByRole('button', { name: /Register Asset/ }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(assetData);
      });
    });

    it('should disable submit button while loading', () => {
      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        loading: true,
      });

      render(<AssetRegistrationForm />);

      const submitButton = screen.getByRole('button', { name: /Registering/ });
      expect(submitButton).toBeDisabled();
    });
  });
});
