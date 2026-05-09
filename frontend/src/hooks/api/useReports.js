import { reportService } from '../../api/services/reports';
import useAsyncOperation from './useAsyncOperation';

export const useAllocationReport = () => {
  const { execute, loading, error, data } = useAsyncOperation(reportService.allocations);
  return { fetchReport: execute, loading, error, data };
};
