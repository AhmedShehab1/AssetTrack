import { get, post, patch, del } from '../client';

export const assetService = {
  list: (params) => get('/assets', { params }),
  create: (body) => post('/assets', body),
  getById: (assetId) => get(`/assets/${assetId}`),
  update: (assetId, body) => patch(`/assets/${assetId}`, body),
  delete: (assetId) => del(`/assets/${assetId}`),
};

export default assetService;
