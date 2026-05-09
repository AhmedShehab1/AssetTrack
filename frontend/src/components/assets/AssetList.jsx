import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  HardDrive,
  User as UserIcon,
  Filter
} from 'lucide-react';
import { assetService } from '../../api/services/assets';
import { userService } from '../../api/services/users';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { AssetType, AssetStatus } from '../../api/types';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [filters, setFormFilters] = useState({
    search: '',
    brand: '',
    status: '',
    assignedTo: ''
  });
  const [page, setPage] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetService.list({ 
        page, 
        size: 10,
        q: filters.search || undefined,
        status: filters.status || undefined,
        // Backend might need specific mapping for brand/user filters
      });
      setAssets(response.content);
      setTotalAssets(response.meta.totalElements);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.list({ size: 100 });
      setUsers(response.content);
    } catch (err) {
      console.error("Failed to fetch users for filter", err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, filters.status]); // Simplified for now

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFormFilters(prev => ({ ...prev, [name]: value }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LAPTOP': return <Laptop size={18} />;
      case 'MONITOR': return <Monitor size={18} />;
      case 'KEYBOARD': return <Keyboard size={18} />;
      case 'MOUSE': return <Mouse size={18} />;
      case 'HEADSET': return <Headphones size={18} />;
      default: return <HardDrive size={18} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading">Asset Master List</h2>
          <p className="text-text-body text-sm mt-1 font-medium">Manage and track all organizational hardware assets.</p>
        </div>
        <Button variant="outline" icon={Download} className="shadow-sm">
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <Card padding="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input 
            label="Search" 
            name="search"
            placeholder="Search ID, Serial, Model..." 
            icon={Search}
            value={filters.search}
            onChange={handleFilterChange}
            onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
          />
          
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Brand</label>
            <div className="relative">
              <select 
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                <option value="">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="HP">HP</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <ChevronRight className="rotate-90" size={16} />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</label>
            <div className="relative">
              <select 
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                <option value="">All Statuses</option>
                {Object.values(AssetStatus).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <ChevronRight className="rotate-90" size={16} />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">User</label>
            <div className="relative">
              <select 
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                <option value="">All Users</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
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
                <th className="py-4 px-6 w-12">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                </th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Asset ID</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Brand & Model</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Serial Number</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-text-body font-medium">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Loading assets...
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-text-body font-medium">
                    No assets found matching your criteria.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-semibold text-text-body bg-slate-100 px-2 py-1 rounded">
                        {asset.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-text-body font-semibold text-sm">
                        {getTypeIcon(asset.type)}
                        {asset.type.charAt(0) + asset.type.slice(1).toLowerCase()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-heading text-sm">{asset.brand}</span>
                        <span className="text-text-body text-xs">{asset.model}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-400">
                      {asset.serialNumber}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-4 px-4">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden border border-primary/10">
                            {asset.assignedTo.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={14} />}
                          </div>
                          <span className="text-sm font-bold text-text-heading">{asset.assignedTo.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs font-medium">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gray-400 hover:text-primary p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-outline-variant transition-all">
                        <MoreVertical size={18} />
                      </button>
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
            Showing <span className="font-bold text-text-heading">{assets.length > 0 ? page * 10 + 1 : 0}</span> to <span className="font-bold text-text-heading">{Math.min((page + 1) * 10, totalAssets)}</span> of <span className="font-bold text-text-heading">{totalAssets}</span> assets
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

export default AssetList;
