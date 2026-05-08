/**
 * @fileoverview
 * AssetTrack — API service layer.
 *
 * Thin, domain-organised wrappers around the `apiClient` convenience methods.
 * One service object per OpenAPI tag.  Hooks import from here; components
 * never call the network directly.
 *
 * Every method returns a Promise that resolves to the typed response or
 * rejects with an `ApiError` (already normalised by the client interceptor).
 */

import { get, post, patch, put, del } from './client';

export const authService = {
  /**
   * @param {{ email: string, password: string, fullName: string }} body
   * @returns {Promise<import('./types').UserResponse>}
   */
  signUp: (body) => post('/auth/signup', body),

  /**
   * @param {{ email: string, password: string }} body
   * @returns {Promise<import('./types').AuthResponse>}
   */
  login: (body) => post('/auth/login', body),

  /**
   * @returns {Promise<import('./types').UserResponse>}
   */
  me: () => get('/auth/me'),

  /**
   * @param {{ currentPassword: string, newPassword: string }} body
   * @returns {Promise<void>}
   */
  changePassword: (body) => patch('/auth/me/password', body),
};

export const userService = {
  /**
   * @param {{ page?: number, size?: number, role?: string, active?: boolean, search?: string }} params
   * @returns {Promise<import('./types').PagedUserResponse>}
   */
  list: (params) => get('/users', { params }),

  /** @param {string} userId */
  getById: (userId) => get(`/users/${userId}`),

  /**
   * @param {string} userId
   * @param {{ fullName?: string, active?: boolean }} body
   */
  update: (userId, body) => patch(`/users/${userId}`, body),

  /** @param {string} userId */
  delete: (userId) => del(`/users/${userId}`),

  /**
   * @param {string} userId
   * @param {{ role: string }} body
   */
  updateRole: (userId, body) => put(`/users/${userId}/role`, body),

  /**
   * @param {string} userId
   * @param {{ page?: number, size?: number }} params
   */
  getAssets: (userId, params) => get(`/users/${userId}/assets`, { params }),
};

export const assetService = {
  /**
   * @param {{ page?: number, size?: number, type?: string, status?: string,
   *           warrantyExpiringWithinDays?: number, warrantyExpired?: boolean }} params
   * @returns {Promise<import('./types').PagedAssetResponse>}
   */
  list: (params) => get('/assets', { params }),

  /**
   * @param {object} body - CreateAssetRequest
   * @returns {Promise<import('./types').AssetResponse>}
   */
  create: (body) => post('/assets', body),

  /** @param {string} assetId */
  getById: (assetId) => get(`/assets/${assetId}`),

  /**
   * @param {string} assetId
   * @param {object} body - UpdateAssetRequest (partial)
   */
  update: (assetId, body) => patch(`/assets/${assetId}`, body),

  /** @param {string} assetId */
  delete: (assetId) => del(`/assets/${assetId}`),
};

export const allocationService = {
  /**
   * @param {string} assetId
   * @param {{ page?: number, size?: number, active?: boolean }} params
   */
  history: (assetId, params) =>
    get(`/assets/${assetId}/allocations`, { params }),

  /**
   * @param {string} assetId
   * @param {{ assignedToUserId: string, notes?: string }} body
   */
  allocate: (assetId, body) => post(`/assets/${assetId}/allocations`, body),

  /**
   * @param {string} assetId
   * @param {string} allocationId
   */
  getById: (assetId, allocationId) =>
    get(`/assets/${assetId}/allocations/${allocationId}`),

  /**
   * @param {string} assetId
   * @param {string} allocationId
   * @param {{ notes?: string }} [body]
   */
  deallocate: (assetId, allocationId, body) =>
    post(`/assets/${assetId}/allocations/${allocationId}/deallocate`, body),
};

export const conditionReportService = {
  list: (assetId, params) =>
    get(`/assets/${assetId}/condition-reports`, { params }),

  create: (assetId, body) =>
    post(`/assets/${assetId}/condition-reports`, body),

  getById: (assetId, reportId) =>
    get(`/assets/${assetId}/condition-reports/${reportId}`),

  update: (assetId, reportId, body) =>
    patch(`/assets/${assetId}/condition-reports/${reportId}`, body),
};

export const notificationService = {
  list: (params) => get('/notifications', { params }),
  markRead: (notificationId) =>
    patch(`/notifications/${notificationId}/read`),
  markAllRead: () => post('/notifications/read-all'),
  getPreferences: () => get('/notifications/preferences'),
  updatePreferences: (body) => put('/notifications/preferences', body),
};

export const dashboardService = {
  inventory: () => get('/dashboard/inventory'),
  expiringWarranties: (params) =>
    get('/dashboard/expiring-warranties', { params }),
};

export const reportService = {
  allocations: (params) => get('/reports/allocations', { params }),
  conditionReports: (params) => get('/reports/condition-reports', { params }),
};

export const searchService = {
  assets: (params) => get('/search/assets', { params }),
  spareLaptop: () => get('/search/assets/spare-laptop'),
  users: (params) => get('/search/users', { params }),
};