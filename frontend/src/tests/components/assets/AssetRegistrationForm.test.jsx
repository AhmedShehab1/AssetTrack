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
      expect(screen.getByText('Register New Asset')).toBeInTheDocument();
      expect(screen.getByText('Hardware Details')).toBeInTheDocument();
      expect(screen.getByText('Lifecycle Information')).toBeInTheDocument();
      expect(screen.getByText('Additional Details')).toBeInTheDocument();

      // Form fields
      expect(screen.getByLabelText(/Asset Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Brand/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Model/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Serial Number/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Purchase Date/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Warranty Expiration/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Condition Notes/)).toBeInTheDocument();

      // Buttons
      expect(screen.getByRole('button', { name: /Save Asset/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });

    it('should have all inputs with correct initial values', () => {
      render(<AssetRegistrationForm />);

      const typeSelect = screen.getByLabelText(/Asset Type/);
      const brandInput = screen.getByLabelText(/Brand/);
      const modelInput = screen.getByLabelText(/Model/);
      const serialInput = screen.getByLabelText(/Serial Number/);
      const purchaseInput = screen.getByLabelText(/Purchase Date/);
      const warrantyInput = screen.getByLabelText(/Warranty Expiration/);
      const notesInput = screen.getByLabelText(/Condition Notes/);

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
      expect(options.length).toBeGreaterThan(1); // At least "Select type..." + enums
      expect(screen.getByText('LAPTOP')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should update form state on input change', async () => {
      render(<AssetRegistrationForm />);

      const typeSelect = screen.getByLabelText(/Asset Type/);
      const brandInput = screen.getByLabelText(/Brand/);

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

      const typeSelect = screen.getByLabelText(/Asset Type/);
      fireEvent.focus(typeSelect);

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('should reset form state when Cancel button is clicked', async () => {
      render(<AssetRegistrationForm />);

      const brandInput = screen.getByLabelText(/Brand/);
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
      expect(mockClearError).not.toHaveBeenCalled();
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
      expect(screen.getByText(/Please fix the highlighted fields below/)).toBeInTheDocument();

      // FormFieldError components should render alert roles with error messages
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
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

      // Initially error banner is shown with validation message
      expect(screen.getByText(/Please fix the highlighted fields below/)).toBeInTheDocument();

      // User focuses on an input
      const brandInput = screen.getByLabelText(/Brand/);
      fireEvent.focus(brandInput);

      // clearError should be called
      expect(mockClearError).toHaveBeenCalled();

      // Simulate error being cleared
      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: null,
      });

      rerender(<AssetRegistrationForm />);

      expect(screen.queryByText(/Please fix the highlighted fields below/)).not.toBeInTheDocument();
    });

    it('should display 400 field errors for invalid serial number pattern', async () => {
      const fieldError = {
        status: 400,
        message: 'Validation failed',
        fieldErrors: [
          {
            field: 'serialNumber',
            rejectedValue: 'abc123',
            message: 'must match uppercase alphanumeric with hyphens only',
          },
        ],
      };

      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: fieldError,
      });

      render(<AssetRegistrationForm />);

      expect(screen.getByText(/Please fix the highlighted fields below/)).toBeInTheDocument();
    });

    it('should display multiple field errors for multiple invalid fields', async () => {
      const fieldErrors = {
        status: 400,
        message: 'Validation failed',
        fieldErrors: [
          { field: 'type', rejectedValue: '', message: 'must not be blank' },
          { field: 'brand', rejectedValue: '', message: 'must not be blank' },
          { field: 'model', rejectedValue: '', message: 'must not be blank' },
          { field: 'serialNumber', rejectedValue: '', message: 'must not be blank' },
          { field: 'purchaseDate', rejectedValue: '', message: 'must not be blank' },
          { field: 'warrantyExpirationDate', rejectedValue: '', message: 'must not be blank' },
        ],
      };

      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        error: fieldErrors,
      });

      render(<AssetRegistrationForm />);

      expect(screen.getByText(/Please fix the highlighted fields below/)).toBeInTheDocument();
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

      fireEvent.change(screen.getByLabelText(/Asset Type/), { target: { value: 'LAPTOP' } });
      fireEvent.change(screen.getByLabelText(/Brand/), { target: { value: 'Dell' } });
      fireEvent.change(screen.getByLabelText(/Model/), { target: { value: 'XPS 15' } });
      fireEvent.change(screen.getByLabelText(/Serial Number/), { target: { value: 'DL-XPS15-20240512' } });
      fireEvent.change(screen.getByLabelText(/Purchase Date/), { target: { value: '2024-05-12' } });
      fireEvent.change(screen.getByLabelText(/Warranty Expiration/), { target: { value: '2027-05-12' } });
      fireEvent.change(screen.getByLabelText(/Condition Notes/), { target: { value: 'New hire device' } });

      const submitButton = screen.getByRole('button', { name: /Save Asset/ });
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

      fireEvent.change(screen.getByLabelText(/Asset Type/), { target: { value: 'LAPTOP' } });
      fireEvent.change(screen.getByLabelText(/Brand/), { target: { value: 'Dell' } });
      fireEvent.change(screen.getByLabelText(/Model/), { target: { value: 'XPS 15' } });
      fireEvent.change(screen.getByLabelText(/Serial Number/), { target: { value: 'DL-XPS15-20240512' } });
      fireEvent.change(screen.getByLabelText(/Purchase Date/), { target: { value: '2024-05-12' } });
      fireEvent.change(screen.getByLabelText(/Warranty Expiration/), { target: { value: '2027-05-12' } });
      fireEvent.change(screen.getByLabelText(/Condition Notes/), { target: { value: 'New hire device' } });

      fireEvent.click(screen.getByRole('button', { name: /Save Asset/ }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(assetData);
      });
    });

    it('should reset form after successful submission', async () => {
      mockCreateAsset.mockResolvedValue({
        id: '123',
        type: 'LAPTOP',
        brand: 'Dell',
        model: 'XPS 15',
        serialNumber: 'DL-XPS15-20240512',
        purchaseDate: '2024-05-12',
        warrantyExpirationDate: '2027-05-12',
        notes: 'Device',
      });

      render(<AssetRegistrationForm />);

      const brandInput = screen.getByLabelText(/Brand/);
      fireEvent.change(brandInput, { target: { value: 'Dell' } });
      fireEvent.change(screen.getByLabelText(/Asset Type/), { target: { value: 'LAPTOP' } });
      fireEvent.change(screen.getByLabelText(/Model/), { target: { value: 'XPS 15' } });
      fireEvent.change(screen.getByLabelText(/Serial Number/), { target: { value: 'DL-XPS15-20240512' } });
      fireEvent.change(screen.getByLabelText(/Purchase Date/), { target: { value: '2024-05-12' } });
      fireEvent.change(screen.getByLabelText(/Warranty Expiration/), { target: { value: '2027-05-12' } });

      expect(brandInput.value).toBe('Dell');

      fireEvent.click(screen.getByRole('button', { name: /Save Asset/ }));

      await waitFor(() => {
        expect(brandInput.value).toBe('');
      });
    });

    it('should disable submit button while loading', () => {
      useAssetTrackModule.useCreateAsset.mockReturnValue({
        ...defaultState,
        loading: true,
      });

      render(<AssetRegistrationForm />);

      const submitButton = screen.getByRole('button', { name: /Saving asset/ });
      expect(submitButton).toBeDisabled();
    });

    it('should not call onSuccess if createAsset returns undefined (error case)', async () => {
      const mockOnSuccess = jest.fn();
      mockCreateAsset.mockResolvedValue(undefined);

      render(<AssetRegistrationForm onSuccess={mockOnSuccess} />);

      fireEvent.change(screen.getByLabelText(/Asset Type/), { target: { value: 'LAPTOP' } });
      fireEvent.change(screen.getByLabelText(/Brand/), { target: { value: 'Dell' } });
      fireEvent.change(screen.getByLabelText(/Model/), { target: { value: 'XPS 15' } });
      fireEvent.change(screen.getByLabelText(/Serial Number/), { target: { value: 'DL-XPS15-20240512' } });
      fireEvent.change(screen.getByLabelText(/Purchase Date/), { target: { value: '2024-05-12' } });
      fireEvent.change(screen.getByLabelText(/Warranty Expiration/), { target: { value: '2027-05-12' } });

      fireEvent.click(screen.getByRole('button', { name: /Save Asset/ }));

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
