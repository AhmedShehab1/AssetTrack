import { notificationService } from '../../api/services/notifications';
import useAsyncOperation from './useAsyncOperation';

export const useNotifications = () => {
  const { execute: fetchNotifications, loading, error } = useAsyncOperation(notificationService.list);
  const { execute: markRead } = useAsyncOperation(notificationService.markRead);
  const { execute: markAllRead } = useAsyncOperation(notificationService.markAllRead);

  return {
    fetchNotifications,
    markRead,
    markAllRead,
    loading,
    error
  };
};

export const useNotificationPreferences = () => {
  const { execute: getPreferences, loading, error } = useAsyncOperation(notificationService.getPreferences);
  const { execute: updatePreferences } = useAsyncOperation(notificationService.updatePreferences);

  return {
    getPreferences,
    updatePreferences,
    loading,
    error
  };
};
