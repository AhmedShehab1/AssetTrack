import { allocationService } from '../../api/services/allocations';
import useAsyncOperation from './useAsyncOperation';

export const useAllocateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(allocationService.allocate);
  return { allocate: execute, loading, error, clearError };
};

export const useDeallocateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(allocationService.deallocate);
  return { deallocate: execute, loading, error, clearError };
};
