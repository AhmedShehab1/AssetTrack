import { userService } from '../../api/services/users';
import useAsyncOperation from './useAsyncOperation';

export const useUsers = () => {
  const { execute, loading, error, data } = useAsyncOperation(userService.list);
  return { fetchUsers: execute, loading, error, users: data?.content || [], meta: data?.meta };
};

export const useUpdateUser = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.update);
  return { updateUser: execute, loading, error, clearError };
};

export const useUpdateUserRole = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.updateRole);
  return { updateUserRole: execute, loading, error, clearError };
};

export const useDeleteUser = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.delete);
  return { deleteUser: execute, loading, error, clearError };
};
