import React, { useEffect, useState } from 'react';
import { 
  X, 
  BatteryMedium, 
  History as HistoryIcon,
  ClipboardList,
  ShieldAlert,
  ArrowLeftRight,
  Edit3,
  Undo2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import AssetHistoryTimeline from './AssetHistoryTimeline';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import Card from '../common/Card';
import { allocationService } from '../../api/services/allocations';
import { assetService } from '../../api/services/assets';
import { useAuth } from '../../hooks/useAssetTrack';

const AssetDetail = ({ asset, isOpen, onClose, onRefresh, onEdit, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deallocating, setDeallocating] = useState(false);
  const [updating, setUpdating] = useState(false);

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
      await allocationService.deallocate(asset.id);
      if (onUpdate) {
        onUpdate(asset.id, { status: 'AVAILABLE', currentOwner: null });
      } else {
        onRefresh?.();
      }
      onClose();
    } catch (err) {
      console.error("Deallocation failed", err);
    } finally {
      setDeallocating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!asset || updating) return;
    
    // Safety check for decommission
    if (newStatus === 'DECOMMISSIONED' && asset.status === 'ALLOCATED') {
      alert("Cannot decommission an allocated asset. Please deallocate it first.");
      return;
    }

    if (newStatus === 'DECOMMISSIONED' && !window.confirm('Are you sure you want to decommission this asset? This action is permanent.')) {
      return;
    }

    setUpdating(true);
    try {
      await assetService.update(asset.id, { status: newStatus });
      if (onUpdate) {
        onUpdate(asset.id, { status: newStatus });
      } else {
        onRefresh?.();
      }
      onClose();
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setUpdating(false);
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
        transform transition-transform duration-500 ease-in-out border-l border-outline-variant
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Panel Header */}
        <div className="flex justify-between items-start p-8 border-b border-outline-variant bg-slate-50/50 shrink-0">
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
        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white font-sans custom-scrollbar">
          {/* Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-3">
            <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
              <p className="text-[9px] font-black text-text-body uppercase tracking-[0.15em] mb-2 opacity-50">Purchased</p>
              <p className="text-xs font-bold text-text-heading">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
            </Card>
            <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
              <p className="text-[9px] font-black text-text-body uppercase tracking-[0.15em] mb-2 opacity-50">Warranty</p>
              <p className={`text-xs font-bold ${asset.warrantyExpired ? 'text-danger' : 'text-text-heading'}`}>
                {new Date(asset.warrantyExpirationDate).toLocaleDateString()}
              </p>
            </Card>
            <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
              <p className="text-[9px] font-black text-text-body uppercase tracking-[0.15em] mb-2 opacity-50">Health</p>
              <p className="text-xs font-bold text-success flex items-center justify-center gap-1">
                <BatteryMedium size={14} /> 98%
              </p>
            </Card>
          </div>

          {/* System Recommendation for Expired Assets */}
          {asset.warrantyExpired && (
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200/50 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                <AlertTriangle size={120} className="text-amber-600" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw size={16} className="text-amber-600" />
                  <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-widest">System Recommendation</h4>
                </div>
                <p className="text-sm text-amber-900/80 font-medium leading-relaxed mb-6">
                  This hardware's warranty has expired. To maintain operational standards, we recommend 
                  <strong> reassigning it to the spare pool</strong> or <strong>retiring</strong> the unit from active service.
                </p>
                <div className="flex gap-2">
                  {currentUser?.role === 'ADMIN' && (
                    <>
                      {asset.status !== 'SPARE' && (
                        <Button 
                          variant="primary" 
                          className="!py-2 !px-4 !text-[11px] bg-amber-600 hover:bg-amber-700 border-none shadow-lg shadow-amber-600/20"
                          onClick={() => handleStatusUpdate('SPARE')}
                          loading={updating}
                        >
                          Move to Spare
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="!py-2 !px-4 !text-[11px] bg-white border-amber-200 text-danger hover:bg-red-50"
                        onClick={() => handleStatusUpdate('DECOMMISSIONED')}
                        loading={updating}
                      >
                        Decommission
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Allocation History Timeline */}
          <div>
             <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.2em] flex items-center gap-2 mb-8 opacity-40">
              <HistoryIcon size={14} />
              Custody Audit Trail
            </h3>
            <AssetHistoryTimeline history={history} loading={loading} />
          </div>

          {/* Detailed Actions Section */}
          <div className="pt-8 border-t border-outline-variant pb-10">
            <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.2em] flex items-center gap-2 mb-6 opacity-40">
              <ClipboardList size={14} />
              Administrative
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {currentUser?.role === 'ADMIN' && (
                <Button 
                  variant="outline" 
                  icon={Edit3} 
                  className="w-full !justify-start !py-4 rounded-2xl hover:bg-slate-50 border-outline-variant text-text-heading font-bold"
                  onClick={() => { onEdit?.(asset); onClose(); }}
                >
                  Edit Asset Profile
                </Button>
              )}
              
              <Button 
                variant="outline" 
                icon={ShieldAlert} 
                className="w-full !justify-start !py-4 rounded-2xl hover:bg-warning-bg border-outline-variant text-warning font-bold"
                onClick={() => { /* Handled in parent */ }}
              >
                Report Hardware Issue
              </Button>
              
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
                <>
                  {isAllocated ? (
                    <Button 
                      variant="outline" 
                      icon={Undo2} 
                      className="w-full !justify-start !py-4 rounded-2xl bg-blue-50/30 border-info/20 text-info font-bold hover:bg-blue-50"
                      onClick={handleDeallocate}
                      loading={deallocating}
                      disabled={deallocating}
                    >
                      Deallocate from Member
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      icon={ArrowLeftRight} 
                      className="w-full !justify-start !py-4 rounded-2xl shadow-xl shadow-primary/10"
                      onClick={() => { /* Handled in parent */ }}
                    >
                      Allocate to Member
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
