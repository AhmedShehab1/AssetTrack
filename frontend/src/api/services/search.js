import { get } from '../client';

export const searchService = {
  assets: (params) => get('/search/assets', { 
    params: {
      status: params.status,
      type: params.type,
      brand: params.brand || params.q, // Map q to brand for now
      serialNumber: params.serialNumber
    }
  }),
  spareLaptop: () => get('/search/assets/spare-laptop'),
  users: (params) => get('/search/users', { params }),
};

export default searchService;
