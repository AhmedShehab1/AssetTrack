import { get, post } from '../client';

export const allocationService = {
  history: (assetId, params) => get(`/assets/${assetId}/allocations`, { params }),
  allocate: (assetId, body) => post(`/assets/${assetId}/allocations`, body),
  getById: (assetId, allocationId) => get(`/assets/${assetId}/allocations/${allocationId}`),
  deallocate: (assetId) => post(`/assets/${assetId}/allocations/deallocate`),
};

export default allocationService;
