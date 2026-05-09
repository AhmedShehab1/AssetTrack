import React, { useEffect, useState } from 'react';
import { 
  X, 
  Calendar, 
  BatteryMedium, 
  History as HistoryIcon,
  ClipboardList,
  ShieldAlert,
  ArrowLeftRight,
  Trash2,
  Edit3,
  Undo2
} from 'lucide-react';
import AssetHistoryTimeline from './AssetHistoryTimeline';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Card from '../common/Card';
import { allocationService } from '../../api/services/allocations';
import { assetService } from '../../api/services/assets';
import { useAuth } from '../../hooks/useAssetTrack';

const AssetDetail = ({ asset, isOpen, onClose, onRefresh, onEdit }) => {
  const { user: currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deallocating, setDeallocating] = useState(false);

  useEffect(() => {
    if (asset && isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const response = await allocationService.history(asset.id, { size: 5 });
          setHistory(response.content || []);
        } catch (err) {
          console.error("Failed to fetch asset history", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [asset, isOpen]);

  const handleDeallocate = async () => {
    if (!asset || deallocating) return;
    setDeallocating(true);
    try {
      const response = await allocationService.history(asset.id, { active: true });
      const activeAlloc = response.content?.[0];
      if (activeAlloc) {
        await allocationService.deallocate(asset.id, activeAlloc.id, { notes: 'Returned via details panel' });
        onRefresh?.();
        onClose();
      }
    } catch (err) {
      console.error("Deallocation failed", err);
    } finally {
      setDeallocating(false);
    }
  };

  const handleDecommission = async () => {
    if (!asset || !window.confirm('Are you sure you want to decommission this asset? This action is permanent.')) return;
    try {
      await assetService.update(asset.id, { status: 'DECOMMISSIONED' });
      onRefresh?.();
      onClose();
    } catch (err) {
      console.error("Decommission failed", err);
    }
  };

  if (!asset) return null;

  const isAllocated = asset.status === 'ALLOCATED';

  return (
    <>
      {/* Slide-out Panel Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Detail Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-[101] flex flex-col 
        transform transition-transform duration-300 ease-in-out border-l border-outline-variant
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Panel Header */}
        <div className="flex justify-between items-start p-8 border-b border-outline-variant bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-extrabold text-text-heading leading-tight">{asset.brand} {asset.model}</h2>
              <StatusBadge status={asset.status} />
            </div>
            <div className="font-mono text-xs text-text-body font-bold tracking-wider uppercase opacity-60">
              SN: {asset.serialNumber}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-body hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-outline-variant"
          >
            <X size={20} />
          </button>
        </div>

        {/* Panel Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white">
          {/* Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
              <p className="text-[9px] font-bold text-text-body uppercase tracking-[0.1em] mb-2">Purchased</p>
              <p className="text-xs font-bold text-text-heading">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
            </Card>
            <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
              <p className="text-[9px] font-bold text-text-body uppercase tracking-[0.1em] mb-2">Warranty</p>
              <p className={`text-xs font-bold ${asset.warrantyExpired ? 'text-danger' : 'text-text-heading'}`}>
                {new Date(asset.warrantyExpirationDate).toLocaleDateString()}
              </p>
            </Card>
            <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
              <p className="text-[9px] font-bold text-text-body uppercase tracking-[0.1em] mb-2">Health</p>
              <p className="text-xs font-bold text-success flex items-center justify-center gap-1">
                <BatteryMedium size={14} /> 98%
              </p>
            </Card>
          </div>

          {/* Allocation History Timeline */}
          <div>
             <h3 className="text-sm font-bold text-text-heading uppercase tracking-widest flex items-center gap-2 mb-6">
              <HistoryIcon size={16} className="text-primary" />
              Ownership History
            </h3>
            <AssetHistoryTimeline history={history} loading={loading} />
          </div>

          {/* Detailed Actions Section */}
          <div className="pt-8 border-t border-outline-variant">
            <h3 className="text-sm font-bold text-text-heading uppercase tracking-widest flex items-center gap-2 mb-6">
              <ClipboardList size={16} className="text-primary" />
              Administrative Actions
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {currentUser?.role === 'ADMIN' && (
                <Button 
                  variant="outline" 
                  icon={Edit3} 
                  className="w-full !justify-start"
                  onClick={() => { onEdit?.(asset); onClose(); }}
                >
                  Edit Asset Details
                </Button>
              )}
              
              <Button variant="outline" icon={ShieldAlert} className="w-full !justify-start text-warning">
                Report Condition Issue
              </Button>
              
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
                <>
                  {isAllocated ? (
                    <Button 
                      variant="outline" 
                      icon={Undo2} 
                      className="w-full !justify-start text-info"
                      onClick={handleDeallocate}
                      loading={deallocating}
                      disabled={deallocating}
                    >
                      Deallocate Asset
                    </Button>
                  ) : (
                    <Button variant="outline" icon={ArrowLeftRight} className="w-full !justify-start text-primary">
                      Manage Allocation
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetDetail;
