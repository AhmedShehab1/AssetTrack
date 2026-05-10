import { get, post, patch, put } from '../client';

export const authService = {
  signUp: (body) => post('/auth/signup', body),
  login: (body) => post('/auth/login', body),
  me: () => get('/auth/me'),
  updateEmail: (body) => put('/auth/me/email', body),
  changePassword: (body) => patch('/auth/me/password', body),
  forgotPassword: (body) => post('/auth/forgot-password', body),
};

export default authService;
