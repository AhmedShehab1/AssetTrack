import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/DashboardPage';
import { dashboardService, assetService } from '../../api/services.js';

// Mock the services
jest.mock('../../api/services.js', () => ({
  dashboardService: {
    inventory: jest.fn(),
  },
  assetService: {
    list: jest.fn(),
  }
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />
}));

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('DashboardPage', () => {
  const mockSummary = {
    totalAssets: 1248,
    byStatus: [
      { status: 'AVAILABLE', count: 210 },
      { status: 'ALLOCATED', count: 980 },
      { status: 'UNDER_REPAIR', count: 58 }
    ]
  };

  const mockAssets = {
    content: [
      { id: 'a1', brand: 'Dell', model: 'XPS 15', serialNumber: 'SN123' },
      { id: 'a2', brand: 'Apple', model: 'MacBook Pro', serialNumber: 'SN456' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardService.inventory.mockResolvedValue(mockSummary);
    assetService.list.mockResolvedValue(mockAssets);
  });

  it('renders summary metrics correctly', async () => {
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      // Values appear in both metric cards and the breakdown list below the chart
      expect(screen.getAllByText('1248')[0]).toBeInTheDocument();
      expect(screen.getByText('Laptops Available')).toBeInTheDocument();
      expect(screen.getAllByText('210')[0]).toBeInTheDocument();
      expect(screen.getByText('Pending Issues')).toBeInTheDocument();
      expect(screen.getAllByText('58')[0]).toBeInTheDocument();
    });
  });

  it('renders recent assets list', async () => {
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Dell XPS 15')).toBeInTheDocument();
      expect(screen.getByText('Apple MacBook Pro')).toBeInTheDocument();
      expect(screen.getByText('SN: SN123')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    dashboardService.inventory.mockRejectedValue(new Error('API Down'));
    
    renderWithRouter(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/API Down/i)).toBeInTheDocument();
    });
  });
});
