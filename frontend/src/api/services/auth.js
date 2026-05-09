import { get, post, patch } from '../client';

export const authService = {
  signUp: (body) => post('/auth/signup', body),
  login: (body) => post('/auth/login', body),
  me: () => get('/auth/me'),
  changePassword: (body) => patch('/auth/me/password', body),
  forgotPassword: (body) => post('/auth/forgot-password', body),
};

export default authService;
