import { conditionReportService } from '../../api/services/conditions';
import useAsyncOperation from './useAsyncOperation';

export const useConditionReports = (assetId) => {
  const { execute: fetchReports, loading, error } = useAsyncOperation((params) => 
    conditionReportService.list(assetId, params)
  );
  
  const { execute: createReport, loading: creating, error: createError } = useAsyncOperation((body) => 
    conditionReportService.create(assetId, body)
  );

  return {
    fetchReports,
    createReport,
    loading,
    creating,
    error,
    createError
  };
};

export const useUpdateConditionReport = () => {
  const { execute, loading, error } = useAsyncOperation(({ assetId, reportId, body }) => 
    conditionReportService.update(assetId, reportId, body)
  );

  return {
    updateReport: execute,
    loading,
    error
  };
};
