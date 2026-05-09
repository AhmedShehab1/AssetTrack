import { get } from '../client';

export const searchService = {
  assets: (params) => get('/search/assets', { params }),
  spareLaptop: () => get('/search/assets/spare-laptop'),
  users: (params) => get('/search/users', { params }),
};

export default searchService;
