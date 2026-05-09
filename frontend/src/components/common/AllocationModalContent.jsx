import React, { useState } from 'react';
import { Calendar, BatteryMedium, Save, CheckCircle2, History as HistoryIcon, ClipboardList } from 'lucide-react';
import Card from './Card';
import SearchableDropdown from './SearchableDropdown';
import Button from './Button';
import ConfirmationStep from './ConfirmationStep';
import { userService } from '../../api/services';
import { useAllocateAsset } from '../../hooks/useAssetTrack';
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
          CURRENT
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { allocate, loading: allocationLoading, error: allocationError } = useAllocateAsset();

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.list({ size: 100 });
        const mappedUsers = (data.content || []).map(user => ({
          ...user,
          name: user.fullName || user.email
        }));
        setUsers(mappedUsers);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-text-heading mb-3">Allocation Successful!</h3>
        <p className="text-text-body mb-8 px-4">
          <span className="font-bold text-text-heading">{assetName}</span> has been successfully reassigned to <span className="font-bold text-text-heading">{selectedUser?.name}</span>.
        </p>
        <Button variant="primary" onClick={onComplete} className="w-full">Done</Button>
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
    <div className="flex flex-col gap-8">
      {error && <GlobalErrorAlert message={error} onClose={() => setError(null)} />}
      
      {/* Quick Specs */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
          <p className="text-[10px] font-bold text-text-body uppercase tracking-wider mb-2">Purchase Date</p>
          <p className="text-sm font-bold text-text-heading">Jan 12, 2023</p>
        </Card>
        <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
          <p className="text-[10px] font-bold text-text-body uppercase tracking-wider mb-2">Warranty Exp</p>
          <p className="text-sm font-bold text-text-heading">Jan 12, 2026</p>
        </Card>
        <Card padding="p-4" className="text-center bg-slate-50 border-none shadow-none">
          <p className="text-[10px] font-bold text-text-body uppercase tracking-wider mb-2">Health</p>
          <p className="text-sm font-bold text-success flex items-center justify-center gap-1.5">
            <BatteryMedium size={16} /> 98%
          </p>
        </Card>
      </div>

      {/* Allocation History */}
      <div>
        <h3 className="text-sm font-bold text-text-heading uppercase tracking-widest flex items-center gap-2 mb-4">
          <HistoryIcon size={16} className="text-primary" />
          Assignment History
        </h3>
        <div className="relative pl-6 space-y-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-outline-variant">
          <HistoryItem 
            name="Sarah Chen" 
            role="Developer" 
            date="March 2024 - Present" 
            active={true} 
          />
          <HistoryItem 
            name="Mike Ross" 
            role="Manager" 
            date="Jan 2023 - March 2024" 
            active={false} 
          />
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-outline-variant pt-8">
        <h3 className="text-sm font-bold text-text-heading uppercase tracking-widest flex items-center gap-2 mb-6">
          <ClipboardList size={16} className="text-primary" />
          New Allocation
        </h3>
        
        <SearchableDropdown 
          label="REASSIGN TO USER" 
          placeholder="Search employees..." 
          options={users} 
          onSelect={setSelectedUser}
        />

        <div className="mt-6 mb-8">
          <label className="block text-[11px] font-bold text-text-body uppercase tracking-wider mb-2">
            ASSIGNMENT NOTES
          </label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document any specific requirements or device condition..." 
            className="w-full min-h-[100px] p-4 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none placeholder:text-text-body/50"
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
            Update Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllocationModalContent;
