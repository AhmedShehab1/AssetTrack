import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { conditionReportService } from '../api/services/conditions';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';
import { RefreshCcw, Eye } from 'lucide-react';

const ConditionReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await conditionReportService.listAll({ size: 1000 });
      // Filter for open issues (OPEN or IN_PROGRESS)
      const openReports = (response.content || []).filter(r => 
        r.status === 'OPEN' || r.status === 'IN_PROGRESS'
      );
      setReports(openReports);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">All Condition Reports</h1>
        <Button onClick={fetchReports} icon={RefreshCcw} variant="outline">Refresh</Button>
      </div>

      {error && <GlobalErrorAlert error={error} />}

      <Card padding="p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-4">Asset</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Status</th>
              <th className="p-4">Description</th>
              <th className="p-4">Reported By</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-10">Loading reports...</td></tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-slate-50">
                  <td className="p-4">{report.asset.brand} {report.asset.model}</td>
                  <td className="p-4"><Badge variant={getSeverityVariant(report.severity)}>{report.severity}</Badge></td>
                  <td className="p-4">{report.status}</td>
                  <td className="p-4">{report.description}</td>
                  <td className="p-4">{report.reportedBy?.fullName}</td>
                  <td className="p-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      icon={Eye}
                      onClick={() => navigate(`/assets/${report.assetId}/reports?reportId=${report.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default ConditionReportsPage;
