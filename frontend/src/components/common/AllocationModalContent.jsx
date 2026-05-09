import React, { useState, useEffect } from 'react';
import { Calendar, BatteryMedium, Save, CheckCircle2, History as HistoryIcon, ClipboardList } from 'lucide-react';
import Card from './Card';
import SearchableDropdown from './SearchableDropdown';
import Button from './Button';
import ConfirmationStep from './ConfirmationStep';
import { userService } from '../../api/services/users';
import { allocationService } from '../../api/services/allocations';
import { useAllocateAsset } from '../../hooks/api/useAllocations';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

const HistoryItem = ({ name, role, date, active }) => (
  <div className={`
    p-4 rounded-xl border transition-all duration-200
    ${active 
      ? 'bg-primary-light border-primary text-primary shadow-sm' 
      : 'bg-surface border-outline-variant text-text-body opacity-60'}
  `}>
    <div className="flex justify-between items-start">
      <div>
        <div className="text-sm font-bold mb-0.5">{name}</div>
        <div className="text-xs font-medium uppercase tracking-wider opacity-80">{role}</div>
      </div>
      {active && (
        <span className="text-[10px] font-extrabold tracking-widest bg-primary text-white px-2 py-0.5 rounded-full">
          ACTIVE
        </span>
      )}
    </div>
    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
      <Calendar size={12} /> {date}
    </div>
  </div>
);

const AllocationModalContent = ({ assetId, assetName, assetSN, onComplete }) => {
  const [step, setStep] = useState('form'); // 'form', 'confirm', or 'success'
  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState('');
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  const { allocate, loading: allocationLoading, error: allocationError } = useAllocateAsset();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersData = await userService.list({ size: 100 });
        setUsers((usersData.content || []).map(u => ({ ...u, name: u.fullName || u.email })));
      } catch (err) {
        setError('Failed to load organizational members');
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await allocationService.history(assetId, { size: 5 });
        setHistory(response.content || []);
      } catch (err) {
        console.error("Failed to load allocation history", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchData();
    fetchHistory();
  }, [assetId]);

  const handleConfirm = async () => {
    const payload = {
      assignedToUserId: selectedUser.id,
      notes: notes.trim() || undefined
    };
    
    const result = await allocate(assetId, payload);
    if (result) {
      setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-10 font-sans">
        <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-heading mb-3">Allocation Successful!</h3>
        <p className="text-text-body mb-8 px-4">
          <span className="font-bold text-text-heading">{assetName}</span> has been successfully allocated to <span className="font-bold text-text-heading">{selectedUser?.name}</span>.
        </p>
        <Button variant="primary" onClick={onComplete} className="w-full">Dismiss</Button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <ConfirmationStep 
        user={selectedUser} 
        asset={assetName} 
        loading={allocationLoading}
        error={allocationError}
        onConfirm={handleConfirm} 
        onCancel={() => setStep('form')} 
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      {(error || allocationError) && <GlobalErrorAlert error={error || allocationError} />}
      
      {/* Allocation History */}
      <div>
        <h3 className="text-sm font-bold text-text-heading uppercase tracking-widest flex items-center gap-2 mb-4">
          <HistoryIcon size={16} className="text-primary" />
          Recent Allocation History
        </h3>
        
        {historyLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-slate-50 rounded-xl border border-outline-variant"></div>
            <div className="h-20 bg-slate-50 rounded-xl border border-outline-variant"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-outline-variant">
            <p className="text-xs text-text-body font-medium opacity-50 uppercase tracking-widest">No prior allocations found</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-outline-variant">
            {history.map((entry) => (
              <HistoryItem 
                key={entry.allocationId || entry.id}
                name={entry.assignedTo?.fullName || 'Unknown User'} 
                role={entry.assignedTo?.role?.replace('ROLE_', '') || 'Member'} 
                date={`${new Date(entry.allocatedAt).toLocaleDateString()} — ${entry.deallocatedAt ? new Date(entry.deallocatedAt).toLocaleDateString() : 'Active'}`} 
                active={!entry.deallocatedAt} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-outline-variant pt-8">
        <h3 className="text-sm font-bold text-text-heading uppercase tracking-widest flex items-center gap-2 mb-6">
          <ClipboardList size={16} className="text-primary" />
          Create New Allocation
        </h3>
        
        <SearchableDropdown 
          label="ALLOCATE TO MEMBER" 
          placeholder="Search employees..." 
          options={users} 
          onSelect={setSelectedUser}
        />

        <div className="mt-6 mb-8">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            ALLOCATION NOTES
          </label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document handover details or specific requirements..." 
            className="w-full min-h-[100px] p-4 rounded-xl border border-outline-variant bg-white text-sm text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none placeholder:text-text-body/30 shadow-inner"
          />
        </div>

        <div className="flex justify-end">
          <Button 
            variant="primary" 
            disabled={!selectedUser || loading}
            onClick={() => setStep('confirm')}
            className="w-full md:w-auto px-10 py-3.5 shadow-xl"
            icon={Save}
          >
            Confirm Allocation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllocationModalContent;
