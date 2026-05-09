import React, { useState } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';

const SearchableDropdown = ({ label, placeholder, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ marginBottom: '20px', position: 'relative' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          cursor: 'pointer',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '14px' }}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <ChevronDown size={18} color="var(--text-secondary)" />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          marginTop: '4px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '8px' }}>
            <input 
              autoFocus
              type="text"
              placeholder="Filter users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', fontSize: '14px' }}
            />
          </div>
          {filteredOptions.map(opt => (
            <div 
              key={opt.id}
              onClick={() => {
                setSelected(opt);
                setIsOpen(false);
                onSelect(opt);
              }}
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-page)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{opt.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{opt.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
