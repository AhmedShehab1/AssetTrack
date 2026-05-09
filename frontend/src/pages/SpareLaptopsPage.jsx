import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Search, 
  User as UserIcon, 
  Calendar, 
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFindSpareLaptop } from '../hooks/api/useSearch';
import { assetService } from '../api/services/assets';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import AllocationModal from '../components/assets/AllocationModal';

const SpareLaptopsPage = () => {
  const { findSpare, loading: finding, spare, error: findError } = useFindSpareLaptop();
  const [allSpares, setAllSpares] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAllSpares = async () => {
    setLoadingList(true);
    try {
      // Fetch assets that are either AVAILABLE or SPARE and are of type LAPTOP
      const availableResponse = await assetService.list({ 
        status: 'AVAILABLE', 
        type: 'LAPTOP',
        size: 50 
      });
      const spareResponse = await assetService.list({ 
        status: 'SPARE', 
        type: 'LAPTOP',
        size: 50 
      });
      
      setAllSpares([...(availableResponse.content || []), ...(spareResponse.content || [])]);
    } catch (err) {
      console.error("Failed to fetch spare laptops", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAllSpares();
  }, []);

  const handleProvision = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-text-heading">Spare Laptop Inventory</h1>
        <p className="text-text-body mt-2">Locate and provision available hardware for team members quickly.</p>
      </div>

      {/* Quick Find Recommendation */}
      <Card className="bg-primary-light border-primary/20 overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">Quick Provisioning</h3>
              <p className="text-text-body text-sm font-medium">Let the system find the most suitable spare laptop for you.</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            onClick={findSpare} 
            loading={finding}
            icon={Search}
            className="shadow-xl px-8"
          >
            Find Next Available
          </Button>
        </div>

        {spare && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-primary/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <Laptop size={24} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-text-heading">{spare.asset.brand} {spare.asset.model}</span>
                    <StatusBadge status={spare.asset.status} />
                  </div>
                  <div className="text-sm text-text-body font-mono">SN: {spare.asset.serialNumber}</div>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Last Owner</div>
                <div className="flex items-center gap-1.5 justify-end text-sm font-bold text-text-heading">
                  <UserIcon size={14} className="text-primary" />
                  {spare.lastOwner?.fullName || 'N/A'}
                </div>
                <div className="text-xs text-text-body">Returned: {formatDate(spare.lastDeallocatedAt)}</div>
              </div>
              <Button variant="primary" onClick={() => handleProvision(spare.asset)}>
                Provision Now
              </Button>
            </div>
          </div>
        )}

        {findError && (
          <div className="mt-6 bg-red-50 text-danger p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{findError.message || "No spare laptops currently available."}</span>
          </div>
        )}
      </Card>

      {/* Full List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-text-heading flex items-center gap-2">
          <CheckCircle2 size={22} className="text-success" />
          Available Pool ({allSpares.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingList ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-24 bg-slate-100 rounded-xl"></div>
              </Card>
            ))
          ) : allSpares.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-outline-variant text-text-body font-medium">
              No spare laptops found in inventory.
            </div>
          ) : (
            allSpares.map(asset => (
              <Card key={asset.id} className="hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg text-text-body group-hover:bg-primary-light group-hover:text-primary transition-colors">
                    <Laptop size={20} />
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
                
                <h4 className="font-bold text-text-heading mb-1">{asset.brand}</h4>
                <p className="text-sm text-text-body mb-4">{asset.model}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-tighter">SN: {asset.serialNumber}</span>
                  <button 
                    onClick={() => handleProvision(asset)}
                    className="text-primary hover:text-primary-dark font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    Provision <ChevronRight size={14} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AllocationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAsset(null);
          fetchAllSpares();
        }}
        asset={selectedAsset}
      />
    </div>
  );
};

export default SpareLaptopsPage;
