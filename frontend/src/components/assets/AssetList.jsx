import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ShieldAlert,
  ArrowLeftRight,
  Undo2,
  Calendar,
  RotateCcw,
  Edit3,
  Plus,
  RefreshCcw,
  Trash2,
  FileText
} from 'lucide-react';
import { assetService } from '../../api/services/assets';
import { userService } from '../../api/services/users';
import { allocationService } from '../../api/services/allocations';
import { useAuth } from '../../hooks/useAssetTrack';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { AssetStatus } from '../../api/types';
import AssetDetail from './AssetDetail';
import ActionModal from '../common/ActionModal';
import { useNavigate } from 'react-router-dom';

const AssetList = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection/Menu state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Unified Modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, payload: null });
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Pagination & Filtering state
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    status: '',
    allocatedTo: ''
  });
  const [page, setPage] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableBrands, setAvailableBrands] = useState([]);

  const fetchAssets = useCallback(async (overrides = {}) => {
    setLoading(true);
    const activeFilters = { ...filters, ...overrides };
    const activePage = overrides.page !== undefined ? overrides.page : page;

    try {
      let response;
      if (currentUser?.role === 'DEVELOPER') {
        // Developers only see their own assets
        response = await userService.getAssets(currentUser.id, {
          page: activePage,
          size: 10
        });
      } else {
        response = await assetService.list({ 
          page: activePage, 
          size: 10,
          brand: activeFilters.brand || undefined,
          serialNumber: (activeFilters.search?.length > 3 ? activeFilters.search : undefined),
          status: activeFilters.status || undefined,
        });
      }
      
      let content = response.content || [];
      
      // Client-side filtering for 'Allocated To' (Admin/Manager only)
      if (currentUser?.role !== 'DEVELOPER' && activeFilters.allocatedTo) {
        content = content.filter(a => a.currentOwner?.id === activeFilters.allocatedTo);
      }

      // Search fallback for non-developers
      if (currentUser?.role !== 'DEVELOPER' && activeFilters.search && content.length === 0 && activePage === 0) {
         const fullSet = await assetService.list({ size: 100 });
         content = fullSet.content.filter(a => 
            a.brand.toLowerCase().includes(activeFilters.search.toLowerCase()) || 
            a.serialNumber.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
            a.model.toLowerCase().includes(activeFilters.search.toLowerCase())
         );
      }

      setAssets(content);
      setTotalAssets(response.meta.totalElements);
      setTotalPages(response.meta.totalPages);

      if (availableBrands.length === 0 && currentUser?.role !== 'DEVELOPER') {
        const fullSet = await assetService.list({ size: 100 });
        const brands = [...new Set(fullSet.content.map(a => a.brand))].sort();
        setAvailableBrands(brands);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, availableBrands.length, currentUser]);

  const fetchUsers = async () => {
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MANAGER') return;
    try {
      const response = await userService.list({ size: 100 });
      setUsers(response.content);
    } catch (err) {
      console.error("Failed to fetch users for filter", err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, filters.status, filters.brand, filters.allocatedTo, fetchAssets]);

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
    setFilters(prev => {
      const next = { ...prev, [name]: value };
      if (page === 0) fetchAssets(next);
      return next;
    });
    setPage(0);
  };

  const handleAssetUpdate = (assetId, updates) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, ...updates } : a));
  };

  const handleDeallocate = async (asset) => {
    if (!asset.currentOwner) return;
    try {
      await allocationService.deallocate(asset.id);
      handleAssetUpdate(asset.id, { status: 'AVAILABLE', currentOwner: null });
    } catch (err) {
      console.error("Deallocation failed", err);
    }
    setActiveMenuId(null);
  };

  const handleQuickStatusUpdate = async (asset, newStatus) => {
    try {
      await assetService.update(asset.id, { status: newStatus });
      handleAssetUpdate(asset.id, { status: newStatus });
    } catch (err) {
      console.error("Status update failed", err);
    }
    setActiveMenuId(null);
  };

  const handleDeletAsset = async (asset) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${asset.brand} asset?`)) return;
    try {
      await assetService.delete(asset.id);
      fetchAssets();
    } catch (err) {
      console.error("Delete failed", err);
    }
    setActiveMenuId(null);
  }

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

  const openModal = (type, payload) => {
    setModalConfig({ isOpen: true, type, payload });
    setActiveMenuId(null);
  };

  const isManagement = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading tracking-tight m-0">
            {currentUser?.role === 'DEVELOPER' ? 'My Allocated Assets' : 'Asset Inventory'}
          </h2>
          <p className="text-text-body text-sm mt-1 font-medium opacity-80">
            {currentUser?.role === 'DEVELOPER' 
              ? 'View and manage hardware currently in your custody.' 
              : 'Unified hardware lifecycle management and tracking.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={() => {}} disabled={assets.length === 0} className="shadow-sm bg-white border-outline-variant">
            Export Audit
          </Button>
          {currentUser?.role === 'ADMIN' && (
            <Button variant="primary" icon={Plus} onClick={() => navigate('/assets/register')} className="shadow-xl">
              Register New
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar - Management Only */}
      {isManagement && (
        <Card padding="p-6" className="bg-slate-50/50 border-outline-variant">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Search Inventory</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Serial, Model..." 
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  value={filters.search}
                  onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <button onClick={() => fetchAssets()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg text-primary transition-colors">
                  <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Brand</label>
              <div className="relative">
                <select name="brand" value={filters.brand} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all">
                  <option value="">All Brands</option>
                  {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Lifecycle</label>
              <div className="relative">
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all">
                  <option value="">All Statuses</option>
                  {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Custodian</label>
              <div className="relative">
                <select name="allocatedTo" value={filters.allocatedTo} onChange={handleFilterChange} className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all">
                  <option value="">Everyone</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <ChevronRight className="rotate-90" size={16} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Table Section */}
      <Card padding="p-0" className="overflow-visible shadow-sm border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Specifications</th>
                <th className="py-5 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Serial Number</th>
                <th className="py-5 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Lifecycle</th>
                {isManagement && (
                  <th className="py-5 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Custodian</th>
                )}
                <th className="py-5 px-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Recommendation</th>
                <th className="py-5 px-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant relative font-sans">
              {loading && assets.length === 0 ? (
                <tr><td colSpan="7" className="py-32 text-center text-text-body font-black uppercase tracking-[0.3em] opacity-30 animate-pulse">Syncing Inventory...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan="7" className="py-32 text-center text-text-body font-medium italic opacity-60">No hardware found.</td></tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold shadow-sm border border-primary/5 group-hover:scale-110 transition-transform">
                          {getTypeIcon(asset.type)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-text-heading text-[15px] truncate">{asset.brand}</span>
                          <span className="text-text-body text-[11px] font-bold opacity-60 uppercase tracking-tighter truncate">{asset.model}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 font-mono text-[12px] text-text-body font-bold tracking-tighter opacity-80">{asset.serialNumber}</td>
                    <td className="py-5 px-4 text-center"><StatusBadge status={asset.status} /></td>
                    {isManagement && (
                      <td className="py-5 px-4">
                        {asset.currentOwner ? (
                          <div className="flex items-center justify-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-black border border-primary/10 shadow-inner">
                              {asset.currentOwner.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={14} />}
                            </div>
                            <span className="text-sm font-bold text-text-heading">{asset.currentOwner.fullName}</span>
                          </div>
                        ) : <div className="text-center text-gray-300 text-[11px] font-black uppercase tracking-widest opacity-40">—</div>}
                      </td>
                    )}
                    <td className="py-5 px-4 text-center">
                      {asset.warrantyExpired ? (
                        <div className="flex justify-center">
                          <div className="group relative flex items-center gap-1.5 text-danger bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 cursor-help">
                            <ShieldAlert size={12} /> Action Needed
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-slate-900 text-white rounded-xl text-[10px] normal-case opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl pointer-events-none">
                              <p className="font-bold mb-1">Warranty Expired</p>
                              <p className="opacity-80 text-white/70">System recommends moving to <strong>Spare Pool</strong> or <strong>Decommissioning</strong>.</p>
                            </div>
                          </div>
                        </div>
                      ) : <div className="text-gray-300 text-[10px] font-bold uppercase tracking-widest opacity-20">Optimal</div>}
                    </td>
                    <td className="py-5 px-8 text-right relative">
                      <button onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)} className={`p-2.5 rounded-xl transition-all border ${activeMenuId === asset.id ? 'bg-white shadow-lg border-outline-variant text-primary' : 'text-gray-400 hover:text-primary hover:bg-white border-transparent hover:border-outline-variant'}`}>
                        <MoreVertical size={20} />
                      </button>
                      {activeMenuId === asset.id && (
                        <div ref={menuRef} className="absolute right-8 top-[70%] mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-outline-variant z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                          <div className="p-2 space-y-1">
                            <button onClick={() => { setSelectedAsset(asset); setIsDetailOpen(true); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-text-body hover:bg-slate-50 hover:text-primary rounded-xl transition-colors">
                              <ArrowLeftRight size={16} /> Allocation & History
                            </button>
                            
                            <button onClick={() => { navigate(`/assets/${asset.id}/reports`); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-text-body hover:bg-slate-50 hover:text-primary rounded-xl transition-colors">
                              <FileText size={16} /> Condition Reports
                            </button>

                            {currentUser?.role === 'ADMIN' && (
                              <button onClick={() => { setSelectedAsset(asset); openModal('EDIT_ASSET', asset); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-text-body hover:bg-slate-50 hover:text-primary rounded-xl transition-colors">
                                <Edit3 size={16} /> Edit Asset Details
                              </button>
                            )}
                            {isManagement && (asset.status === 'AVAILABLE' || asset.status === 'SPARE') && (
                               <button onClick={() => { setSelectedAsset(asset); openModal('ALLOCATE', asset); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-primary bg-primary-light/10 hover:bg-primary-light/30 rounded-xl transition-colors">
                                 <UserPlus size={16} /> Allocate to Member
                               </button>
                            )}
                            {asset.currentOwner && isManagement && (
                              <button onClick={() => handleDeallocate(asset)} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-info hover:bg-blue-50 rounded-xl transition-colors">
                                <Undo2 size={16} /> Deallocate from Member
                              </button>
                            )}
                            <button onClick={() => { setSelectedAsset(asset); openModal('REPORT_ISSUE', asset); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-warning hover:bg-warning-bg rounded-xl transition-colors">
                              <ShieldAlert size={16} /> Report Issue
                            </button>
                            {currentUser?.role === 'ADMIN' && (
                              <>
                                <div className="my-1 border-t border-outline-variant/50"></div>
                                <button onClick={() => handleDeletAsset(asset)} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-danger hover:bg-danger-bg rounded-xl transition-colors">
                                  <Trash2 size={16} /> Delete Asset Record
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

        <div className="bg-slate-50 border-t border-outline-variant px-8 py-5 flex items-center justify-between">
          <span className="text-[12px] text-text-body font-bold opacity-60 uppercase tracking-widest">
            Inventory Snapshot — <span className="text-text-heading font-black">{totalAssets} items</span>
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="p-2.5 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
              <ChevronLeft size={18} />
            </button>
            <div className="px-6 text-[11px] font-black text-text-heading uppercase tracking-tighter">
              Page {page + 1} / {totalPages || 1}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="p-2.5 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>

      <AssetDetail 
        asset={selectedAsset}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={fetchAssets}
        onUpdate={handleAssetUpdate}
        onEdit={(asset) => { setSelectedAsset(asset); openModal('EDIT_ASSET', asset); }}
        onAllocate={(asset) => { setSelectedAsset(asset); openModal('ALLOCATE', asset); }}
        onReportIssue={(asset) => { setSelectedAsset(asset); openModal('REPORT_ISSUE', asset); }}
      />

      <ActionModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        payload={modalConfig.payload}
        onSuccess={handleAssetUpdate}
        onRefresh={fetchAssets}
      />
    </div>
  );
};

export default AssetList;
