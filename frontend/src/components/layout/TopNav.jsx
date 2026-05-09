import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Laptop, User as UserIcon, Loader2, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAssetTrack';
import NotificationBell from './NotificationBell';
import { searchService } from '../../api/services/search';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const TopNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/[\s.@]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchService.assets({ q: searchQuery, size: 5 });
        setResults(data.content || []);
      } catch (err) {
        console.error("Global search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (asset) => {
    setShowResults(false);
    setSearchQuery('');
    // Ideally navigate to a specific asset detail page or open its detail in AssetList
    navigate('/assets'); 
  };

  return (
    <header className="h-[var(--header-height)] bg-white border-b border-outline-variant px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="relative w-full max-w-md" ref={searchRef}>
        <div className={`
          flex items-center w-full bg-bg-page px-4 py-2 rounded-xl border transition-all
          ${showResults ? 'border-primary ring-4 ring-primary/5 shadow-lg' : 'border-outline-variant'}
        `}>
          <Search size={18} className={showResults ? 'text-primary' : 'text-text-body'} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            placeholder="Search assets, serials, or brands..." 
            className="bg-transparent border-none ml-3 w-full outline-none text-sm text-text-heading placeholder:text-text-body/60 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-text-heading">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchQuery.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-body uppercase tracking-widest">Asset Results</span>
              {loading && <Loader2 size={14} className="animate-spin text-primary" />}
            </div>
            
            <div className="max-h-[320px] overflow-y-auto">
              {!loading && results.length === 0 ? (
                <div className="p-8 text-center text-text-body text-xs font-medium italic">
                  No matches found for "{searchQuery}"
                </div>
              ) : (
                results.map((asset) => (
                  <button 
                    key={asset.id}
                    onClick={() => handleResultClick(asset)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-outline-variant last:border-0 text-left group"
                  >
                    <div className="bg-white p-2 rounded-lg border border-outline-variant shadow-sm group-hover:border-primary/30 group-hover:text-primary transition-all">
                      <Laptop size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-text-heading text-sm truncate">{asset.brand} {asset.model}</span>
                        <StatusBadge status={asset.status} className="scale-[0.8] origin-left" />
                      </div>
                      <div className="text-[10px] font-mono text-text-body opacity-60">SN: {asset.serialNumber}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>

            <div className="p-3 text-center bg-slate-50/50 border-t border-outline-variant">
              <button 
                onClick={() => navigate('/assets')}
                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
              >
                View all in assets list
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        <NotificationBell />
        
        <div className="flex items-center gap-2 border-l border-outline-variant pl-5">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-text-heading leading-none">{user?.fullName || 'User'}</span>
            <span className="text-[10px] text-text-body font-bold uppercase tracking-tighter mt-1">{user?.role?.replace('ROLE_', '') || 'Member'}</span>
          </div>
          <div 
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform"
            title={user?.fullName || user?.email}
          >
            {getInitials(user?.fullName || user?.email)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
