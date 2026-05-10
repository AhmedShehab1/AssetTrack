import { get } from '../client';

export const dashboardService = {
  inventory: () => get('/dashboard/inventory'),
  expiringWarranties: (params) => get('/dashboard/expiring-warranties', { params }),
};

export default dashboardService;
