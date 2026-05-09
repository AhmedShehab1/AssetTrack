import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }} onClick={onClose}>
      <div style={{
        width: '500px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '24px 30px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>{title}</h2>
              <span style={{ 
                backgroundColor: 'var(--info-bg)', 
                color: 'var(--info)', 
                fontSize: '11px', 
                fontWeight: '700', 
                padding: '4px 10px', 
                borderRadius: '20px' 
              }}>ASSIGNED</span>
            </div>
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', letterSpacing: '0.05em' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
          {children}
        </div>

        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Modal;
