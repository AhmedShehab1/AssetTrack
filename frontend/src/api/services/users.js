import { get, post, patch, put, del } from '../client';

export const userService = {
  list: (params) => get('/users', { params }),
  create: (body) => post('/auth/signup', body),
  getById: (userId) => get(`/users/${userId}`),
  
  // Note: Backend doesn't support partial PATCH for generic info yet.
  // It has specific endpoints for status and role.
  updateStatus: (userId, active) => put(`/users/${userId}/status`, null, { params: { active } }),
  updateRole: (userId, role) => put(`/users/${userId}/role`, null, { params: { role } }),
  
  delete: (userId) => del(`/users/${userId}`),
  getAssets: (userId, params) => get(`/users/${userId}/assets`, { params }),
};

export default userService;
