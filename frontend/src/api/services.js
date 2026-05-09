/**
 * @fileoverview
 * AssetTrack — API service layer.
 */

import { get, post, patch, put, del } from './client';

// ── AUTH SERVICE ─────────────────────────────────────────────────────────────

export const authService = {
  signUp: (body) => post('/auth/signup', body),
  login: (body) => post('/auth/login', body),
  me: () => get('/auth/me'),
  changePassword: (body) => patch('/auth/me/password', body),
};

// ── USER SERVICE ─────────────────────────────────────────────────────────────

export const userService = {
  list: (params) => get('/users', { params }),
  getById: (userId) => get(`/users/${userId}`),
  update: (userId, body) => patch(`/users/${userId}`, body),
  delete: (userId) => del(`/users/${userId}`),
  updateRole: (userId, body) => put(`/users/${userId}/role`, body),
  getAssets: (userId, params) => get(`/users/${userId}/assets`, { params }),
};

// ── ASSET SERVICE ────────────────────────────────────────────────────────────

export const assetService = {
  list: (params) => get('/assets', { params }),
  create: (body) => post('/assets', body),
  getById: (assetId) => get(`/assets/${assetId}`),
  update: (assetId, body) => patch(`/assets/${assetId}`, body),
  delete: (assetId) => del(`/assets/${assetId}`),
};

// ── ALLOCATION SERVICE ───────────────────────────────────────────────────────

export const allocationService = {
  history: (assetId, params) => get(`/assets/${assetId}/allocations`, { params }),
  allocate: (assetId, body) => post(`/assets/${assetId}/allocations`, body),
  getById: (assetId, allocationId) => get(`/assets/${assetId}/allocations/${allocationId}`),
  deallocate: (assetId, allocationId, body) => post(`/assets/${assetId}/allocations/${allocationId}/deallocate`, body),
};

// ── CONDITION REPORT SERVICE ──────────────────────────────────────────────────

export const conditionReportService = {
  list: (assetId, params) => get(`/assets/${assetId}/condition-reports`, { params }),
  create: (assetId, body) => post(`/assets/${assetId}/condition-reports`, body),
  getById: (assetId, reportId) => get(`/assets/${assetId}/condition-reports/${reportId}`),
  update: (assetId, reportId, body) => patch(`/assets/${assetId}/condition-reports/${reportId}`, body),
};

// ── DASHBOARD & NOTIFICATIONS ───────────────────────────────────────────────

export const dashboardService = {
  inventory: () => get('/dashboard/inventory'),
  expiringWarranties: (params) => get('/dashboard/expiring-warranties', { params }),
};

export const notificationService = {
  list: (params) => get('/notifications', { params }),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => post('/notifications/read-all'),
  getPreferences: () => get('/notifications/preferences'),
  updatePreferences: (body) => put('/notifications/preferences', body),
};

// ── SEARCH & REPORTS ────────────────────────────────────────────────────────

export const searchService = {
  assets: (params) => get('/search/assets', { params }),
  spareLaptop: () => get('/search/assets/spare-laptop'),
  users: (params) => get('/search/users', { params }),
};

export const reportService = {
  allocations: (params) => get('/reports/allocations', { params }),
  conditionReports: (params) => get('/reports/condition-reports', { params }),
};
