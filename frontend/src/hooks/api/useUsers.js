import { userService } from '../../api/services/users';
import useAsyncOperation from './useAsyncOperation';

export const useCreateUser = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.create);
  return { createUser: execute, loading, error, clearError };
};

export const useUpdateUserStatus = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(({ userId, active }) => 
    userService.updateStatus(userId, active)
  );
  return { updateStatus: execute, loading, error, clearError };
};

export const useUpdateUserRole = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(({ userId, role }) => 
    userService.updateRole(userId, role)
  );
  return { updateRole: execute, loading, error, clearError };
};

export const useDeleteUser = () => {
  const { execute, loading, error, clearError } = useAsyncOperation(userService.delete);
  return { deleteUser: execute, loading, error, clearError };
};
