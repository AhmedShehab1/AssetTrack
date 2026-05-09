import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  Calendar,
  History as HistoryIcon,
  ArrowRight,
  Package
} from 'lucide-react';
import { reportService } from '../../api/services/reports';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const AllocationList = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [filters, setFormFilters] = useState({
    search: '',
    status: 'active' // 'active', 'all', 'returned'
  });
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const response = await reportService.allocations({ 
        page, 
        size: 10,
        activeOnly: filters.status === 'active' ? true : (filters.status === 'returned' ? false : undefined),
        // q: filters.search || undefined, // Backend might not support 'q' for allocations report yet
      });
      setAllocations(response.content);
      setTotalItems(response.meta.totalElements);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [page, filters.status]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFormFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading">Global Allocation History</h2>
          <p className="text-text-body text-sm mt-1 font-medium">Track all asset assignments and returns across the organization.</p>
        </div>
        <Button variant="outline" icon={Download} className="shadow-sm">
          Export Report
        </Button>
      </div>

      {/* Filter Bar */}
      <Card padding="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Search" 
            name="search"
            placeholder="Search Serial, User, Model..." 
            icon={Search}
            value={filters.search}
            onChange={handleFilterChange}
            onKeyDown={(e) => e.key === 'Enter' && fetchAllocations()}
          />
          
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</label>
            <div className="relative">
              <select 
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                <option value="all">All Allocations</option>
                <option value="active">Active Only</option>
                <option value="returned">Returned Only</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <ChevronRight className="rotate-90" size={16} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Asset Details</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Timeline</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-body font-medium">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Loading allocations...
                    </div>
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-body font-medium">
                    No allocation records found.
                  </td>
                </tr>
              ) : (
                allocations.map((allocation) => (
                  <tr key={allocation.allocationId} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-text-body">
                          <Package size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-heading text-sm">{allocation.assetBrand} {allocation.assetModel}</span>
                          <span className="text-xs font-mono text-gray-400 uppercase tracking-tighter">SN: {allocation.assetSerialNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-bold border border-primary/10">
                          {allocation.assignedTo?.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={14} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-heading">{allocation.assignedTo?.fullName}</span>
                          <span className="text-[10px] text-text-body opacity-70 uppercase tracking-wider">{allocation.assignedTo?.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Allocated</span>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-body bg-white border border-outline-variant px-2.5 py-1 rounded-lg">
                            <Calendar size={12} className="text-primary" />
                            {formatDate(allocation.allocatedAt)}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 mt-4" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Returned</span>
                          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                            allocation.deallocatedAt 
                              ? 'text-text-body bg-white border-outline-variant' 
                              : 'text-primary bg-primary-light border-primary/20 italic'
                          }`}>
                            <Calendar size={12} className={allocation.deallocatedAt ? 'text-gray-400' : 'text-primary'} />
                            {allocation.deallocatedAt ? formatDate(allocation.deallocatedAt) : 'Currently Active'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase border ${
                          !allocation.deallocatedAt 
                            ? 'bg-success-bg text-success border-success/20' 
                            : 'bg-slate-100 text-text-body border-slate-200'
                        }`}>
                          {!allocation.deallocatedAt ? 'ACTIVE' : 'RETURNED'}
                        </span>
                        {!allocation.deallocatedAt && (
                          <button 
                            onClick={async () => {
                              try {
                                await allocationService.deallocate(allocation.assetId, allocation.allocationId, { notes: 'Marked as returned from history' });
                                fetchAllocations();
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                          >
                            Mark as Returned
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-text-heading">
                      {allocation.durationDays}d
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="bg-slate-50 border-t border-outline-variant px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-text-body font-medium">
            Showing <span className="font-bold text-text-heading">{allocations.length > 0 ? page * 10 + 1 : 0}</span> to <span className="font-bold text-text-heading">{Math.min((page + 1) * 10, totalItems)}</span> of <span className="font-bold text-text-heading">{totalItems}</span> records
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 text-sm font-bold text-text-heading">
              Page {page + 1} of {totalPages || 1}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AllocationList;
