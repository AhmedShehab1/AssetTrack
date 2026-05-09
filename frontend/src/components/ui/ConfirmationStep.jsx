import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from './Button';

const ConfirmationStep = ({ user, asset, onConfirm, onCancel }) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        backgroundColor: 'var(--warning-bg)', 
        color: 'var(--warning)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <AlertCircle size={32} />
      </div>
      <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Confirm Allocation</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
        Are you sure you want to reassign <strong>{asset}</strong> to <strong>{user.name}</strong> ({user.role})? 
        This will update the asset status and record this in the history.
      </p>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Button variant="outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm} style={{ flex: 1 }}>Confirm Reassignment</Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
