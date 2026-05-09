import { get, patch, put, del } from '../client';

export const userService = {
  list: (params) => get('/users', { params }),
  getById: (userId) => get(`/users/${userId}`),
  update: (userId, body) => patch(`/users/${userId}`, body),
  delete: (userId) => del(`/users/${userId}`),
  updateRole: (userId, body) => put(`/users/${userId}/role`, body),
  getAssets: (userId, params) => get(`/users/${userId}/assets`, { params }),
};

export default userService;
