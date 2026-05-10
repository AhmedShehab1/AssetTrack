import { assetService } from '../../api/services/assets';
import useAsyncOperation from './useAsyncOperation';

export const useCreateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(assetService.create);
  return { createAsset: execute, loading, error, clearError };
};

export const useUpdateAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(assetService.update);
  return { updateAsset: execute, loading, error, clearError };
};

export const useDeleteAsset = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(assetService.delete);
  return { deleteAsset: execute, loading, error, clearError };
};
