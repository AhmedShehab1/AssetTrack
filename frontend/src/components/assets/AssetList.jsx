import React, { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  Eye,
  ShieldAlert,
  ArrowLeftRight,
  Trash2,
  Undo2
} from 'lucide-react';
import { assetService } from '../../api/services/assets';
import { userService } from '../../api/services/users';
import { allocationService } from '../../api/services/allocations';
import { useAuth } from '../../hooks/useAssetTrack';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { AssetType, AssetStatus } from '../../api/types';
import AllocationModal from './AllocationModal';
import AssetDetail from './AssetDetail';
import ConditionReportModal from './ConditionReportModal';

const AssetList = () => {
  const { user: currentUser } = useAuth();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection/Menu state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Modals state
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
    if (currentUser?.role === 'DEVELOPER') return;
    try {
      const response = await userService.list({ size: 100 });
      setUsers(response.content);
    } catch (err) {
      console.error("Failed to fetch users for filter", err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, filters.status]);

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFormFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDeallocate = async (asset) => {
    if (!asset.currentOwner) return;
    
    try {
      const history = await allocationService.history(asset.id, { active: true });
      const activeAlloc = history.content?.[0];
      if (activeAlloc) {
        await allocationService.deallocate(asset.id, activeAlloc.id, { notes: 'Returned via asset list' });
        fetchAssets();
      }
    } catch (err) {
      console.error("Deallocation failed", err);
    }
    setActiveMenuId(null);
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

  const handleExportCSV = () => {
    if (assets.length === 0) return;
    
    const headers = ['ID', 'Type', 'Brand', 'Model', 'Serial Number', 'Status', 'Current Owner'];
    const rows = assets.map(a => [
      a.id,
      a.type,
      a.brand,
      a.model,
      a.serialNumber,
      a.status,
      a.currentOwner?.fullName || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asset_track_inventory_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading">Asset Master List</h2>
          <p className="text-text-body text-sm mt-1 font-medium">Manage and track all organizational hardware assets.</p>
        </div>
        <Button 
          variant="outline" 
          icon={Download} 
          className="shadow-sm"
          onClick={handleExportCSV}
          disabled={assets.length === 0}
        >
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
                disabled={currentUser?.role === 'DEVELOPER'}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all disabled:opacity-50"
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
      <Card padding="p-0" className="overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-4 px-6 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                </th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Identity</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Specification</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Tracking</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Current Owner</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant relative">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-text-body font-medium">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Loading assets...
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-text-body font-medium">
                    No assets found matching your criteria.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-[10px] font-bold text-text-body bg-slate-100 px-2 py-0.5 rounded border border-outline-variant/30 mb-1">
                          #{asset.id.slice(0, 8).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {getTypeIcon(asset.type)}
                          {asset.type}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-center">
                        <span className="font-bold text-text-heading text-sm">{asset.brand}</span>
                        <span className="text-text-body text-xs">{asset.model}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-gray-500 font-medium text-center tracking-tight">
                      {asset.serialNumber}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-4 px-4">
                      {asset.currentOwner ? (
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-bold border border-primary/10">
                            {asset.currentOwner.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={14} />}
                          </div>
                          <span className="text-sm font-bold text-text-heading">{asset.currentOwner.fullName}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-300 text-[11px] font-bold uppercase tracking-widest">—</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                        className={`p-2 rounded-xl transition-all border ${activeMenuId === asset.id ? 'bg-white shadow-md border-outline-variant text-primary' : 'text-gray-400 hover:text-primary hover:bg-white border-transparent hover:border-outline-variant'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === asset.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-6 top-[70%] mt-1 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
                        >
                          <div className="p-2 space-y-0.5">
                            <button 
                              onClick={() => { setSelectedAsset(asset); setIsDetailOpen(true); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-text-body hover:bg-slate-50 hover:text-primary rounded-xl transition-colors"
                            >
                              <Eye size={16} /> View Details & History
                            </button>
                            
                            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
                              <>
                                {(asset.status === 'AVAILABLE' || asset.status === 'SPARE') ? (
                                  <button 
                                    onClick={() => { setSelectedAsset(asset); setIsAllocModalOpen(true); setActiveMenuId(null); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-primary hover:bg-primary-light/30 rounded-xl transition-colors"
                                  >
                                    <UserPlus size={16} /> Assign to Member
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleDeallocate(asset)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-info hover:bg-blue-50 rounded-xl transition-colors"
                                  >
                                    <Undo2 size={16} /> Return to Inventory
                                  </button>
                                )}
                              </>
                            )}

                            {/* Report issue: Developers can only report if they own the asset */}
                            {(currentUser?.role !== 'DEVELOPER' || asset.currentOwner?.id === currentUser?.id) && (
                              <button 
                                onClick={() => { setSelectedAsset(asset); setIsReportModalOpen(true); setActiveMenuId(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-warning hover:bg-warning-bg rounded-xl transition-colors"
                              >
                                <ShieldAlert size={16} /> Report Issue
                              </button>
                            )}

                            {currentUser?.role === 'ADMIN' && (
                              <>
                                <div className="my-1 border-t border-outline-variant/50"></div>
                                <button 
                                  onClick={async () => {
                                    if (window.confirm('Decommission this asset?')) {
                                      await assetService.update(asset.id, { status: 'DECOMMISSIONED' });
                                      fetchAssets();
                                    }
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-danger hover:bg-danger-bg rounded-xl transition-colors"
                                >
                                  <Trash2 size={16} /> Decommission
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
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

      <AllocationModal 
        isOpen={isAllocModalOpen} 
        onClose={() => { setIsAllocModalOpen(false); fetchAssets(); }} 
        asset={selectedAsset} 
      />

      <AssetDetail 
        asset={selectedAsset}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={fetchAssets}
      />

      <ConditionReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        asset={selectedAsset}
      />
    </div>
  );
};

export default AssetList;
