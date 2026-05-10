import { searchService } from '../../api/services/search';
import useAsyncOperation from './useAsyncOperation';

export const useFindSpareLaptop = () => {
  const { execute, loading, error, data } = useAsyncOperation(searchService.spareLaptop);
  return { findSpare: execute, loading, error, spare: data };
};
