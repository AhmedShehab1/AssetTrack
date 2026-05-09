import { userService } from '../../api/services/users';
import useAsyncOperation from './useAsyncOperation';

export const useUpdateUser = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.update);
  return { updateUser: execute, loading, error, clearError };
};

export const useDeleteUser = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.delete);
  return { deleteUser: execute, loading, error, clearError };
};
