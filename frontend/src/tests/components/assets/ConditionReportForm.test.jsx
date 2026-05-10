import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConditionReportForm from '../../../components/assets/ConditionReportForm';
import * as useConditionReportsModule from '../../../hooks/api/useConditionReports';

// Mock the hook
jest.mock('../../../hooks/api/useConditionReports', () => ({
  useConditionReports: jest.fn()
}));

describe('ConditionReportForm', () => {
  const mockCreateReport = jest.fn();
  const mockClearError = jest.fn();
  const assetId = 'asset-1';
  const assetName = 'Test Macbook';

  beforeEach(() => {
    jest.clearAllMocks();
    useConditionReportsModule.useConditionReports.mockReturnValue({
      createReport: mockCreateReport,
      creating: false,
      createError: null,
      clearError: mockClearError,
    });
  });

  it('renders form and submits successfully', async () => {
    mockCreateReport.mockResolvedValue({ id: 'report-1' });
    const onComplete = jest.fn();

    render(
      <ConditionReportForm 
        assetId={assetId} 
        assetName={assetName} 
        onComplete={onComplete} 
        onCancel={jest.fn()} 
      />
    );

    // Enter description
    const textarea = screen.getByPlaceholderText(/describe the issue in detail/i);
    fireEvent.change(textarea, { target: { value: 'The screen is flickering constantly.' } });

    // Select severity (High)
    const highBtn = screen.getByText('HIGH');
    fireEvent.click(highBtn);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateReport).toHaveBeenCalledWith({
        description: 'The screen is flickering constantly.',
        severity: 'HIGH'
      });
    });

    // Should show success state
    expect(await screen.findByText('Report Submitted')).toBeInTheDocument();

    // Click return button
    fireEvent.click(screen.getByText('Return to Dashboard'));
    expect(onComplete).toHaveBeenCalled();
  });

  it('handles submission error', async () => {
    useConditionReportsModule.useConditionReports.mockReturnValue({
      createReport: mockCreateReport,
      creating: false,
      createError: { message: 'Submission failed' },
      clearError: mockClearError,
    });

    render(
      <ConditionReportForm 
        assetId={assetId} 
        assetName={assetName} 
        onComplete={jest.fn()} 
        onCancel={jest.fn()} 
      />
    );

    expect(screen.getByText('Submission failed')).toBeInTheDocument();
  });
});
