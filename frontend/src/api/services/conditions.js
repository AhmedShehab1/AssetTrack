import { get, post, patch } from '../client';

export const conditionReportService = {
  list: (assetId, params) => get(`/assets/${assetId}/condition-reports`, { params }),
  create: (assetId, body) => post(`/assets/${assetId}/condition-reports`, body),
  getById: (assetId, reportId) => get(`/assets/${assetId}/condition-reports/${reportId}`),
  update: (assetId, reportId, body) => patch(`/assets/${assetId}/condition-reports/${reportId}`, body),
};

export default conditionReportService;
