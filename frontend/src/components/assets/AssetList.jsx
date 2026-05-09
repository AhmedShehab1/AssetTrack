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
  Undo2,
  Calendar,
  Clock,
  RotateCcw,
  Edit3,
  Plus
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
import AssetEditModal from './AssetEditModal';
import ConditionReportModal from './ConditionReportModal';
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

  // Modals state
  const [isAllocModalOpen, setIsAllocModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pagination & Filtering state
  const [filters, setFormFilters] = useState({
    search: '',
    brand: '',
    status: '',
    allocatedTo: ''
  });
  const [page, setPage] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Derive unique brands from current assets (simplification)
  const [availableBrands, setAvailableBrands] = useState([]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetService.list({ 
        page, 
        size: 10,
        // Backend supports status, type, brand, serialNumber
        brand: filters.brand || (filters.search?.length > 2 ? filters.search : undefined),
        serialNumber: (filters.search?.length > 4 ? filters.search : undefined),
        status: filters.status || undefined,
      });
      
      let content = response.content || [];
      
      // Client-side filtering for 'Allocated To' as backend doesn't support it in main list
      if (filters.allocatedTo) {
        content = content.filter(a => a.currentOwner?.id === filters.allocatedTo);
      }

      setAssets(content);
      setTotalAssets(response.meta.totalElements);
      setTotalPages(response.meta.totalPages);

      // Extract unique brands for the filter dropdown
      if (availableBrands.length === 0) {
        const fullSet = await assetService.list({ size: 100 });
        const brands = [...new Set(fullSet.content.map(a => a.brand))].sort();
        setAvailableBrands(brands);
      }
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
  }, [page, filters.status, filters.brand, filters.allocatedTo]);

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

  const handleExportCSV = () => {
    if (assets.length === 0) return;
    const headers = ['ID', 'Type', 'Brand', 'Model', 'Serial Number', 'Status', 'Expiry', 'Owner'];
    const rows = assets.map(a => [
      a.id, a.type, a.brand, a.model, a.serialNumber, a.status, a.warrantyExpirationDate, a.currentOwner?.fullName || 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `inventory_${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading tracking-tight">Asset Master List</h2>
          <p className="text-text-body text-sm mt-1 font-medium opacity-80">Full lifecycle management and organizational tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExportCSV} disabled={assets.length === 0} className="shadow-sm bg-white">
            Export CSV
          </Button>
          {currentUser?.role === 'ADMIN' && (
            <Button variant="primary" icon={Plus} onClick={() => navigate('/assets/register')} className="shadow-lg">
              Register New Asset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card padding="p-6" className="bg-slate-50/50 border-outline-variant">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Input 
            label="Search" 
            name="search"
            placeholder="ID, Serial, etc..." 
            icon={Search}
            value={filters.search}
            onChange={handleFilterChange}
          />
          
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Brand</label>
            <div className="relative">
              <select 
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                <option value="">All Brands</option>
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
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
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
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
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Allocated To</label>
            <div className="relative">
              <select 
                name="allocatedTo"
                value={filters.allocatedTo}
                onChange={handleFilterChange}
                disabled={currentUser?.role === 'DEVELOPER'}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all disabled:opacity-50"
              >
                <option value="">Everyone</option>
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
      <Card padding="p-0" className="overflow-visible shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-4 px-6 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                </th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Specifications</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Serial Number</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Warranty Expiry</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Current Owner</th>
                <th className="py-4 px-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant relative font-sans">
              {loading ? (
                <tr><td colSpan="7" className="py-24 text-center text-text-body font-bold uppercase tracking-widest opacity-40 animate-pulse">Syncing Inventory...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan="7" className="py-24 text-center text-text-body font-medium italic opacity-60">No results found matching filters.</td></tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 text-center">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold shadow-sm border border-primary/5 group-hover:scale-110 transition-transform">
                          {getTypeIcon(asset.type)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-heading text-sm">{asset.brand}</span>
                          <span className="text-text-body text-[11px] font-medium opacity-70 uppercase tracking-tighter">{asset.model}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-gray-500 font-bold text-center tracking-tight opacity-80">
                      {asset.serialNumber}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`flex flex-col items-center ${asset.warrantyExpired ? 'text-danger' : 'text-text-body'}`}>
                        <span className="text-[13px] font-bold">{new Date(asset.warrantyExpirationDate).toLocaleDateString()}</span>
                        <span className="text-[9px] font-black uppercase opacity-50 tracking-widest">
                          {asset.warrantyExpired ? 'EXPIRED' : `${asset.warrantyExpiresInDays}d Left`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-4 px-4">
                      {asset.currentOwner ? (
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-black border border-primary/10 shadow-inner">
                            {asset.currentOwner.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={14} />}
                          </div>
                          <span className="text-sm font-bold text-text-heading">{asset.currentOwner.fullName}</span>
                        </div>
                      ) : (
                        <div className="text-center"><span className="text-gray-300 text-[11px] font-bold uppercase tracking-widest">—</span></div>
                      )}
                    </td>
                    <td className="py-4 px-8 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === asset.id ? null : asset.id)}
                        className={`p-2 rounded-xl transition-all border ${activeMenuId === asset.id ? 'bg-white shadow-md border-outline-variant text-primary' : 'text-gray-400 hover:text-primary hover:bg-white border-transparent hover:border-outline-variant'}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeMenuId === asset.id && (
                        <div ref={menuRef} className="absolute right-6 top-[70%] mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-outline-variant z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                          <div className="p-2 space-y-0.5">
                            {/* Unified Details action (reusing dashboard component logic) */}
                            <button 
                              onClick={() => { setSelectedAsset(asset); setIsAllocModalOpen(true); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-text-body hover:bg-slate-50 hover:text-primary rounded-xl transition-colors"
                            >
                              <ArrowLeftRight size={16} /> Allocation & History
                            </button>

                            {currentUser?.role === 'ADMIN' && (
                              <button 
                                onClick={() => { setSelectedAsset(asset); setIsEditModalOpen(true); setActiveMenuId(null); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-text-body hover:bg-slate-50 hover:text-primary rounded-xl transition-colors"
                              >
                                <Edit3 size={16} /> Edit Asset Details
                              </button>
                            )}

                            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && !asset.currentOwner && (
                               <button 
                                  onClick={() => { setSelectedAsset(asset); setIsAllocModalOpen(true); setActiveMenuId(null); }}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-primary hover:bg-primary-light/30 rounded-xl transition-colors"
                               >
                                 <UserPlus size={16} /> Allocate to Member
                               </button>
                            )}

                            {asset.currentOwner && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
                              <button 
                                onClick={() => handleDeallocate(asset)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-info hover:bg-blue-50 rounded-xl transition-colors"
                              >
                                <Undo2 size={16} /> Deallocate Asset
                              </button>
                            )}

                            {currentUser?.role === 'ADMIN' && asset.warrantyExpired && asset.status !== 'SPARE' && (
                              <button 
                                onClick={() => handleQuickStatusUpdate(asset, 'SPARE')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              >
                                <RotateCcw size={16} /> Reassign as Spare
                              </button>
                            )}

                            <button 
                              onClick={() => { setSelectedAsset(asset); setIsReportModalOpen(true); setActiveMenuId(null); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-warning hover:bg-warning-bg rounded-xl transition-colors"
                            >
                              <ShieldAlert size={16} /> Report Issue
                            </button>

                            {currentUser?.role === 'ADMIN' && (
                              <>
                                <div className="my-1 border-t border-outline-variant/50"></div>
                                <button 
                                  onClick={() => handleDeletAsset(asset)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-danger hover:bg-danger-bg rounded-xl transition-colors"
                                >
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

        {/* Footer / Pagination */}
        <div className="bg-slate-50 border-t border-outline-variant px-8 py-5 flex items-center justify-between">
          <span className="text-sm text-text-body font-bold opacity-70">
            Showing <span className="text-text-heading font-black">{assets.length}</span> — inventory items
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-5 text-sm font-black text-text-heading uppercase tracking-tighter">
              Page {page + 1} / {totalPages || 1}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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
        onUpdate={handleAssetUpdate}
        onEdit={(asset) => { setSelectedAsset(asset); setIsEditModalOpen(true); }}
      />

      <AssetEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        asset={selectedAsset}
        onUpdate={handleAssetUpdate}
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
