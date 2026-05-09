/**
 * @fileoverview
 * AssetTrack — API service layer.
 *
 * Thin, domain-organised wrappers around the `apiClient` convenience methods.
 * One service object per OpenAPI tag. Hooks import from here; components
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

  /**
   * @param {{ email: string }} body
   * @returns {Promise<import('./types').UserResponse>}
   */
  updateEmail: (body) => put('/auth/me/email', body),

  /**
   * @returns {Promise<void>}
   */
  deleteAccount: () => del('/auth/me'),
};

export const userService = {
  /**
   * @param {{ page?: number, size?: number, role?: string, active?: boolean, search?: string }} params
   * @returns {Promise<import('./types').PagedUserResponse>}
   */
  list: (params) => get('/users', { params }),

  /**
   * @param {{ page?: number, size?: number }} params
   * @returns {Promise<import('./types').PagedUserResponse>}
   */
  listInactive: (params) => get('/users/inactive', { params }),

  /**
   * @param {string} userId
   * @returns {Promise<import('./types').UserResponse>}
   */
  getById: (userId) => get(`/users/${userId}`),

  /**
   * @param {string} userId
   * @param {{ fullName?: string, active?: boolean }} body
   * @returns {Promise<import('./types').UserResponse>}
   */
  update: (userId, body) => patch(`/users/${userId}`, body),

  /**
   * @param {string} userId
   * @param {{ active: boolean }} body
   * @returns {Promise<import('./types').UserResponse>}
   */
  updateStatus: (userId, body) => put(`/users/${userId}/status`, body),

  /**
   * @param {string} userId
   * @returns {Promise<void>}
   */
  delete: (userId) => del(`/users/${userId}`),

  /**
   * @param {string} userId
   * @param {{ role: string }} body
   * @returns {Promise<void>}
   */
  updateRole: (userId, body) => put(`/users/${userId}/role`, body),

  /**
   * @param {string} userId
   * @param {{ page?: number, size?: number }} params
   * @returns {Promise<import('./types').PagedAssetResponse>}
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

  /**
   * @param {string} assetId
   * @returns {Promise<import('./types').AssetResponse>}
   */
  getById: (assetId) => get(`/assets/${assetId}`),

  /**
   * @param {string} assetId
   * @param {object} body - UpdateAssetRequest
   * @returns {Promise<import('./types').AssetResponse>}
   */
  update: (assetId, body) => patch(`/assets/${assetId}`, body),

  /**
   * @param {string} assetId
   * @returns {Promise<void>}
   */
  delete: (assetId) => del(`/assets/${assetId}`),
};

export const allocationService = {
  /**
   * @param {string} assetId
   * @param {{ page?: number, size?: number, active?: boolean }} params
   * @returns {Promise<import('./types').PagedAllocationResponse>}
   */
  history: (assetId, params) =>
    get(`/assets/${assetId}/allocations`, { params }),

  /**
   * @param {string} assetId
   * @param {{ assignedToUserId: string, notes?: string }} body
   * @returns {Promise<import('./types').AllocationResponse>}
   */
  allocate: (assetId, body) => post(`/assets/${assetId}/allocations`, body),

  /**
   * @param {string} assetId
   * @param {string} allocationId
   * @returns {Promise<import('./types').AllocationResponse>}
   */
  getById: (assetId, allocationId) =>
    get(`/assets/${assetId}/allocations/${allocationId}`),

  /**
   * @param {string} assetId
   * @param {string} allocationId
   * @param {{ notes?: string }} [body]
   * @returns {Promise<import('./types').AllocationResponse>}
   */
  deallocate: (assetId, allocationId, body) =>
    post(`/assets/${assetId}/allocations/${allocationId}/deallocate`, body),
};

export const conditionReportService = {
  /**
   * @param {string} assetId
   * @param {{ page?: number, size?: number }} params
   * @returns {Promise<import('./types').PagedConditionReportResponse>}
   */
  list: (assetId, params) =>
    get(`/assets/${assetId}/condition-reports`, { params }),

  /**
   * @param {string} assetId
   * @param {object} body - CreateConditionReportRequest
   * @returns {Promise<import('./types').ConditionReportResponse>}
   */
  create: (assetId, body) =>
    post(`/assets/${assetId}/condition-reports`, body),

  /**
   * @param {string} assetId
   * @param {string} reportId
   * @returns {Promise<import('./types').ConditionReportResponse>}
   */
  getById: (assetId, reportId) =>
    get(`/assets/${assetId}/condition-reports/${reportId}`),

  /**
   * @param {string} assetId
   * @param {string} reportId
   * @param {object} body - UpdateConditionReportRequest
   * @returns {Promise<import('./types').ConditionReportResponse>}
   */
  update: (assetId, reportId, body) =>
    patch(`/assets/${assetId}/condition-reports/${reportId}`, body),
};

export const notificationService = {
  /**
   * @param {{ page?: number, size?: number, read?: boolean, type?: string }} params
   * @returns {Promise<import('./types').PagedNotificationResponse>}
   */
  list: (params) => get('/notifications', { params }),

  /**
   * @param {string} notificationId
   * @returns {Promise<void>}
   */
  markRead: (notificationId) =>
    patch(`/notifications/${notificationId}/read`),

  /**
   * @returns {Promise<void>}
   */
  markAllRead: () => post('/notifications/read-all'),

  /**
   * @returns {Promise<import('./types').NotificationPreferencesResponse>}
   */
  getPreferences: () => get('/notifications/preferences'),

  /**
   * @param {object} body - NotificationPreferencesRequest
   * @returns {Promise<import('./types').NotificationPreferencesResponse>}
   */
  updatePreferences: (body) => put('/notifications/preferences', body),
};

export const dashboardService = {
  /**
   * @returns {Promise<import('./types').InventoryDashboardResponse>}
   */
  inventory: () => get('/dashboard/inventory'),

  /**
   * @param {{ page?: number, size?: number, withinDays?: number }} params
   * @returns {Promise<import('./types').PagedExpiringAssetResponse>}
   */
  expiringWarranties: (params) =>
    get('/dashboard/expiring-warranties', { params }),
};

export const reportService = {
  /**
   * @param {{ page?: number, size?: number, userId?: string, assetType?: string }} params
   * @returns {Promise<import('./types').PagedAllocationHistoryResponse>}
   */
  allocations: (params) => get('/reports/allocations', { params }),

  /**
   * @param {{ page?: number, size?: number, status?: string, severity?: string }} params
   * @returns {Promise<import('./types').PagedConditionReportResponse>}
   */
  conditionReports: (params) => get('/reports/condition-reports', { params }),
};

export const searchService = {
  /**
   * @param {object} params - Search filters and pagination
   * @returns {Promise<import('./types').PagedAssetResponse>}
   */
  assets: (params) => get('/search/assets', { params }),

  /**
   * @returns {Promise<import('./types').SpareAssetResponse>}
   */
  spareLaptop: () => get('/search/assets/spare-laptop'),

  /**
   * @param {{ q: string, page?: number, size?: number }} params
   * @returns {Promise<import('./types').PagedUserResponse>}
   */
  users: (params) => get('/search/users', { params }),
};