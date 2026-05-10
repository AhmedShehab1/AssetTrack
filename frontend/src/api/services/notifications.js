import { get, post, patch, put } from '../client';

export const notificationService = {
  list: (params) => get('/notifications', { params }),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => post('/notifications/read-all'),
  getPreferences: () => get('/notifications/preferences'),
  updatePreferences: (body) => put('/notifications/preferences', body),
};

export default notificationService;
