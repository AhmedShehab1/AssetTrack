import { get } from '../client';

export const reportService = {
  allocations: (params) => get('/reports/allocations', { params }),
  conditionReports: (params) => get('/reports/condition-reports', { params }),
};

export default reportService;
