import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  History, 
  Clock, 
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { allocationService } from '../../api/services/allocations';
import { useAuth } from '../../hooks/useAssetTrack';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

const AllocationList = () => {
  const { user: currentUser } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' // all, active, returned
  });
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const response = await allocationService.history(null, { 
        page, 
        size: 10,
        active: filters.status === 'active' ? true : (filters.status === 'returned' ? false : undefined)
      });
      // Note: Backend might not support global history on this endpoint yet
      // If it doesn't, this component would typically show current user's allocations or report data.
      setAllocations(response.content || []);
      setTotalItems(response.meta.totalElements || 0);
      setTotalPages(response.meta.totalPages || 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [page, filters.status]);

  const handleExportCSV = () => {
    if (allocations.length === 0) return;
    const headers = ['Allocation ID', 'Asset', 'Member', 'Date Allocated', 'Date Returned', 'Notes'];
    const rows = allocations.map(a => [
      a.allocationId || a.id,
      `${a.assetBrand} ${a.assetModel} (${a.assetSerialNumber})`,
      a.assignedTo?.fullName || 'N/A',
      a.allocatedAt,
      a.deallocatedAt || 'Active',
      a.notes || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `allocation_audit_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading tracking-tight">Organization Allocation Audit</h2>
          <p className="text-text-body text-sm mt-1 font-medium opacity-80">Full history of organizational hardware movements and custody.</p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExportCSV} disabled={allocations.length === 0} className="shadow-sm bg-white">
          Export Audit Log
        </Button>
      </div>

      {error && <GlobalErrorAlert error={error} />}

      {/* Filter Bar */}
      <Card padding="p-6" className="bg-slate-50/50 border-outline-variant">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input 
              label="Member Search"
              placeholder="Filter by employee name..." 
              icon={Search}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="flex flex-col space-y-1.5 min-w-[200px]">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Custody Status</label>
            <div className="relative">
              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                <option value="all">Complete History</option>
                <option value="active">Active Allocations</option>
                <option value="returned">Previous Custodians</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <Filter size={16} />
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={fetchAllocations} className="bg-white">Apply Filters</Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="p-0" className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Asset Details</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Allocated To</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Checkout</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Return</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center text-text-body font-bold uppercase tracking-widest opacity-40 animate-pulse">Querying History...</td></tr>
              ) : allocations.length === 0 ? (
                <tr><td colSpan="6" className="py-24 text-center text-text-body font-medium italic opacity-60">No allocation records found for this period.</td></tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc.id || alloc.allocationId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-heading text-sm">{alloc.assetBrand} {alloc.assetModel}</span>
                        <span className="text-[10px] font-mono text-text-body opacity-60 uppercase tracking-tighter">SN: {alloc.assetSerialNumber}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-black border border-primary/10">
                          {alloc.assignedTo?.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={14} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-heading">{alloc.assignedTo?.fullName}</span>
                          <span className="text-[10px] text-text-body opacity-70 uppercase tracking-wider">{alloc.assignedTo?.role?.replace('ROLE_', '')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar size={14} className="text-text-body opacity-20 mb-1" />
                        <span className="text-[12px] font-bold text-text-heading">{new Date(alloc.allocatedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <RotateCcw size={14} className="text-text-body opacity-20 mb-1" />
                        <span className="text-[12px] font-bold text-text-body opacity-80">
                          {alloc.deallocatedAt ? new Date(alloc.deallocatedAt).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      {!alloc.deallocatedAt ? (
                        <div className="inline-flex items-center gap-1.5 text-primary bg-primary-light/50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                          <CheckCircle2 size={12} /> Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-text-body bg-slate-100 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-outline-variant opacity-60">
                          <XCircle size={12} /> Closed
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-8 text-right">
                      {alloc.notes ? (
                        <div className="inline-block group relative">
                          <FileText size={18} className="text-gray-400 hover:text-primary cursor-help ml-auto" />
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                            {alloc.notes}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-outline-variant px-8 py-5 flex items-center justify-between">
          <span className="text-sm text-text-body font-bold opacity-70">
            Showing <span className="text-text-heading font-black">{allocations.length}</span> — custody records
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-5 text-sm font-black text-text-heading uppercase tracking-tighter">
              Page {page + 1} / {totalPages || 1}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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
