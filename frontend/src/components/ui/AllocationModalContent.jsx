import React, { useState } from 'react';
import { Calendar, BatteryMedium, Save, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import SearchableDropdown from './SearchableDropdown';
import Button from './Button';
import ConfirmationStep from './ConfirmationStep';
import axios from 'axios';

const StatusBadge = ({ text, active }) => (
  <div style={{
    backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-page)',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '16px',
    flex: 1,
    position: 'relative',
    opacity: active ? 1 : 0.6
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Sarah Chen</div>
        <div style={{ fontSize: '12px' }}>Developer</div>
      </div>
      {active && <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--primary)' }}>CURRENT</span>}
    </div>
    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
      <Calendar size={12} /> March 2024 - Present
    </div>
    {active && <div style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--primary)', backgroundColor: 'white' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', margin: '1px' }}></div>
    </div>}
  </div>
);

const AllocationModalContent = ({ assetName, assetSN, onComplete }) => {
  const [step, setStep] = useState('form'); // 'form', 'confirm', or 'success'
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:3001/users');
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (step === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--success-bg)', 
          color: 'var(--success)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <CheckCircle2 size={32} />
        </div>
        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Allocation Successful!</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          <strong>{assetName}</strong> has been reassigned to <strong>{selectedUser?.name}</strong>.
        </p>
        <Button variant="primary" onClick={onComplete} style={{ width: '100%' }}>Done</Button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <ConfirmationStep 
        user={selectedUser} 
        asset={assetName} 
        onConfirm={() => setStep('success')} 
        onCancel={() => setStep('form')} 
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Quick Specs */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Card padding="16px" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Purchase Date</p>
          <p style={{ fontSize: '15px', fontWeight: '700' }}>Jan 12, 2023</p>
        </Card>
        <Card padding="16px" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Warranty Exp</p>
          <p style={{ fontSize: '15px', fontWeight: '700' }}>Jan 12, 2026</p>
        </Card>
        <Card padding="16px" style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Battery Health</p>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <BatteryMedium size={16} /> 98%
          </p>
        </Card>
      </div>

      {/* Allocation History */}
      <div>
        <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          Allocation History
        </h3>
        <div style={{ paddingLeft: '20px', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <StatusBadge active={true} />
          <div style={{ opacity: 0.5, backgroundColor: 'var(--bg-page)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>Mike Ross</div>
              <div style={{ fontSize: '12px' }}>Manager</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
              <Calendar size={12} /> Jan 2023 - March 2024
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Actions</h3>
        
        <SearchableDropdown 
          label="Reassign Asset" 
          placeholder="Search user..." 
          options={users} 
          onSelect={setSelectedUser}
        />

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Report Condition
          </label>
          <textarea 
            placeholder="Note any scratches, dents, or operational issues..." 
            style={{ 
              width: '100%', 
              minHeight: '100px', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              fontSize: '14px', 
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="primary" 
            disabled={!selectedUser}
            onClick={() => setStep('confirm')}
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            <Save size={18} /> Update Asset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllocationModalContent;
