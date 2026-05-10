import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2, History as HistoryIcon, ClipboardList } from 'lucide-react';
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
        <div className="text-xs font-medium uppercase tracking-[0.1em] opacity-80">{role}</div>
      </div>
      {active && (
        <span className="text-[9px] font-black tracking-widest bg-primary text-white px-2 py-0.5 rounded-full border border-primary/20 shadow-sm shadow-primary/20">
          ACTIVE
        </span>
      )}
    </div>
    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold opacity-60">
      <Calendar size={12} className="opacity-40" /> {date}
    </div>
  </div>
);

const AllocationModalContent = ({ assetId, assetName, assetSN, onComplete, onSuccess }) => {
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
      const userSummary = {
        id: selectedUser.id,
        fullName: selectedUser.fullName || selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role
      };
      onSuccess?.(userSummary);
      setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-10 font-sans animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-8 shadow-inner border border-success/10">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-text-heading mb-3 tracking-tight">Allocation Successful</h3>
        <p className="text-text-body mb-10 px-4 leading-relaxed font-medium">
          <span className="text-text-heading font-bold">{assetName}</span> is now under the custody of <span className="text-primary font-bold">{selectedUser?.name}</span>.
        </p>
        <Button variant="primary" onClick={onComplete} className="w-full !py-4 rounded-2xl shadow-xl shadow-primary/20">
          Dismiss & Return
        </Button>
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
    <div className="flex flex-col gap-10 font-sans pb-10">
      {(error || allocationError) && <GlobalErrorAlert error={error || allocationError} />}
      
      {/* Allocation History */}
      <div>
        <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.2em] flex items-center gap-2 mb-6 opacity-40">
          <HistoryIcon size={14} />
          Custody Audit Trail
        </h3>
        
        {historyLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-slate-50 rounded-2xl border border-outline-variant"></div>
            <div className="h-24 bg-slate-50 rounded-2xl border border-outline-variant"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-outline-variant">
            <p className="text-xs text-text-body font-bold uppercase tracking-widest opacity-40">No prior allocations documented</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-outline-variant">
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
      <div className="border-t border-outline-variant pt-10">
        <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.2em] flex items-center gap-2 mb-8 opacity-40">
          <ClipboardList size={14} />
          Initiate New Custody
        </h3>
        
        <div className="space-y-8">
          <SearchableDropdown 
            label="SELECT CUSTODIAN" 
            placeholder="Search by name or email..." 
            options={users} 
            onSelect={setSelectedUser}
          />

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
              HANDOVER NOTES
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record any specific conditions or requirements for this handover..." 
              className="w-full min-h-[120px] p-5 rounded-2xl border border-outline-variant bg-slate-50/30 text-sm text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none placeholder:text-text-body/30 shadow-inner"
            />
          </div>

          <div className="pt-4">
            <Button 
              variant="primary" 
              disabled={!selectedUser || loading || allocationLoading}
              onClick={() => setStep('confirm')}
              className="w-full !py-4 rounded-2xl shadow-2xl shadow-primary/20 font-bold"
              icon={Save}
            >
              Continue to Confirmation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationModalContent;
