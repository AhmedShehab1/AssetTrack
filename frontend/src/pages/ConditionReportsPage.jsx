import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conditionReportService } from '../api/services/conditions';
import Card from '../components/common/Card';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const ConditionReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      console.log("DEBUG: fetchReports called!");
      try {
        const response = await conditionReportService.listAll({ size: 1000 });
        console.log("DEBUG: Full API response object:", JSON.stringify(response, null, 2));
        
        // Log individual parts to pinpoint where data is
        if (response) {
            console.log("DEBUG: response.content:", response.content);
            console.log("DEBUG: response.data:", response.data);
            console.log("DEBUG: response (direct):", response);
        }

        setReports(response.content || response.data || (Array.isArray(response) ? response : []));
      } catch (err) {
        console.error("Condition Reports API Error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <h1 className="text-3xl font-extrabold text-text-heading">All Condition Reports</h1>
      {error && <GlobalErrorAlert error={error} />}
      {loading ? (
        <div className="text-center py-20">Loading reports...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map(report => (
            <Card 
              key={report.id} 
              padding="p-6" 
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => {
                console.log("Clicked report:", report);
                navigate(`/assets/${report.assetId}/reports?reportId=${report.id}`);
              }}
            >              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{report.asset.brand} {report.asset.model}</h3>
                  <p className="text-sm text-text-body">{report.description}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${report.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {report.status}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConditionReportsPage;
