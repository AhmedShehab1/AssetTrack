import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  Clock,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Monitor,
  Cpu,
  Keyboard,
  Headphones,
  Mouse,
  HardDrive,
  Package,
  ArrowRight,
  Calendar,
  RotateCcw,
  Timer,
  Layers,
} from 'lucide-react';
import { assetService } from '../../api/services/assets';
import { allocationService } from '../../api/services/allocations';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

// ── helpers ────────────────────────────────────────────────────────────────

const ASSET_TYPE_ICONS = {
  LAPTOP: Cpu,
  MONITOR: Monitor,
  KEYBOARD: Keyboard,
  MOUSE: Mouse,
  HEADSET: Headphones,
  DOCKING_STATION: HardDrive,
  OTHER: Package,
};

const TYPE_COLORS = {
  LAPTOP: 'bg-blue-50 text-blue-600 border-blue-100',
  MONITOR: 'bg-violet-50 text-violet-600 border-violet-100',
  KEYBOARD: 'bg-amber-50 text-amber-600 border-amber-100',
  MOUSE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  HEADSET: 'bg-rose-50 text-rose-600 border-rose-100',
  DOCKING_STATION: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  OTHER: 'bg-slate-50 text-slate-500 border-slate-200',
};

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const initials = (name) =>
  name ? name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() : '?';

const durationLabel = (start, end) => {
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return '< 1 day';
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo` : `${Math.floor(months / 12)}yr ${months % 12}mo`;
};

// Avatar colours keyed by first initial
const AVATAR_PALETTE = [
  'bg-primary text-white',
  'bg-violet-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
  'bg-indigo-500 text-white',
];
const avatarColor = (name) =>
  AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length];

// ── sub-components ─────────────────────────────────────────────────────────

const AssetTypeIcon = ({ type, size = 16 }) => {
  const Icon = ASSET_TYPE_ICONS[type] || Package;
  return <Icon size={size} />;
};

const Avatar = ({ name, size = 'md' }) => {
  const cls = avatarColor(name);
  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div className={`${dim} ${cls} rounded-full flex items-center justify-center font-black shrink-0`}>
      {initials(name)}
    </div>
  );
};

// ── DeviceListPanel ─────────────────────────────────────────────────────────

const DeviceListPanel = ({ selectedId, onSelect }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { status: 'ALLOCATED', page, size: 15 };
      if (debouncedSearch) params.q = debouncedSearch;
      const res = await assetService.list(params);
      setAssets(res?.content || []);
      setTotalPages(res?.meta?.totalPages || 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-5 pt-5 pb-4 border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={15} className="text-primary opacity-70" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-text-body opacity-60">
            Allocated Devices
          </h3>
        </div>
        <Input
          placeholder="Search brand, model, serial…"
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {error && (
          <div className="p-4">
            <GlobalErrorAlert error={error} />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-body opacity-40 text-sm font-medium italic">
            No allocated devices found.
          </div>
        ) : (
          <ul className="p-3 flex flex-col gap-1.5">
            {assets.map((asset) => {
              const isSelected = asset.id === selectedId;
              const TypeIcon = ASSET_TYPE_ICONS[asset.type] || Package;
              const typeColor = TYPE_COLORS[asset.type] || TYPE_COLORS.OTHER;
              return (
                <li key={asset.id}>
                  <button
                    onClick={() => onSelect(asset)}
                    className={`w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all border
                      ${isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-white hover:bg-slate-50 border-outline-variant hover:border-slate-300'
                      }`}
                  >
                    {/* Type badge */}
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors
                      ${isSelected ? 'bg-white/20 border-white/30 text-white' : typeColor}`}
                    >
                      <TypeIcon size={16} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-text-heading'}`}>
                        {asset.brand} {asset.model}
                      </p>
                      <p className={`text-[10px] font-mono mt-0.5 truncate ${isSelected ? 'text-white/70' : 'text-text-body opacity-50'}`}>
                        {asset.serialNumber}
                      </p>
                    </div>

                    {/* Current owner pip */}
                    {asset.currentOwner && (
                      <div className={`shrink-0 text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border
                        ${isSelected ? 'bg-white/15 border-white/30 text-white' : 'bg-primary-light text-primary border-primary/20'}`}>
                        {asset.currentOwner.fullName.split(' ')[0]}
                      </div>
                    )}

                    {isSelected && <ArrowRight size={14} className="text-white/80 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-outline-variant px-4 py-3 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="p-1.5 rounded-lg border border-outline-variant bg-white text-text-body disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-text-body uppercase tracking-wider opacity-60">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="p-1.5 rounded-lg border border-outline-variant bg-white text-text-body disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── HistoryPanel ────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
      <Clock size={28} className="text-slate-300" />
    </div>
    <div>
      <p className="text-sm font-bold text-text-heading opacity-60">Select a device</p>
      <p className="text-xs text-text-body opacity-40 mt-1">
        Pick any allocated asset on the left to view its full custody history.
      </p>
    </div>
  </div>
);

const HistoryPanel = ({ asset, onExport }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => { setPage(0); }, [asset?.id]);

  useEffect(() => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    allocationService
      .history(asset.id, { page, size: 10 })
      .then((res) => {
        setHistory(res?.content || []);
        setTotalPages(res?.meta?.totalPages || 1);
        setTotalElements(res?.meta?.totalElements || 0);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [asset?.id, page]);

  const handleExport = () => {
    if (!history.length) return;
    const headers = ['Allocation ID', 'Assigned To', 'Role', 'Checked Out', 'Returned', 'Duration (days)'];
    const rows = history.map((h) => [
      h.allocationId || h.id,
      h.assignedTo?.fullName || 'N/A',
      h.assignedTo?.role?.replace('ROLE_', '') || '',
      h.allocatedAt,
      h.deallocatedAt || 'Active',
      h.durationDays ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `custody_${asset.serialNumber}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (!asset) return <EmptyState />;

  const TypeIcon = ASSET_TYPE_ICONS[asset.type] || Package;
  const typeColor = TYPE_COLORS[asset.type] || TYPE_COLORS.OTHER;

  return (
    <div className="flex flex-col h-full">
      {/* Asset hero header */}
      <div className="px-6 pt-6 pb-5 border-b border-outline-variant shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${typeColor}`}>
              <TypeIcon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text-heading leading-tight">
                {asset.brand} {asset.model}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-mono text-text-body opacity-50 uppercase tracking-tighter">
                  SN: {asset.serialNumber}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${typeColor}`}>
                  {asset.type?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            icon={Download}
            onClick={handleExport}
            disabled={history.length === 0}
            className="bg-white border-outline-variant shadow-sm shrink-0"
          >
            Export
          </Button>
        </div>

        {/* Current owner callout */}
        {asset.currentOwner && (
          <div className="mt-4 flex items-center gap-3 bg-primary-light/40 border border-primary/15 rounded-xl px-4 py-3">
            <Avatar name={asset.currentOwner.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-primary leading-tight">{asset.currentOwner.fullName}</p>
              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider">
                {asset.currentOwner.role?.replace('ROLE_', '')} · Current Custodian
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
              <CheckCircle2 size={10} /> Active
            </div>
          </div>
        )}
      </div>

      {/* History header */}
      <div className="px-6 py-3 border-b border-outline-variant bg-slate-50/60 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-text-body opacity-40" />
          <span className="text-[10px] font-black uppercase tracking-widest text-text-body opacity-50">
            Custody History
          </span>
        </div>
        {totalElements > 0 && (
          <span className="text-[10px] font-bold text-text-body opacity-40">
            {totalElements} record{totalElements !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
        {error && <GlobalErrorAlert error={error} />}

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 text-text-body opacity-40 text-sm italic font-medium">
            No allocation records for this asset.
          </div>
        ) : (
          <ol className="relative">
            {history.map((entry, idx) => {
              const isActive = !entry.deallocatedAt;
              const isLast = idx === history.length - 1;
              return (
                <li key={entry.allocationId || entry.id} className="flex gap-4 pb-1">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 z-10 mt-1
                      ${isActive ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}
                    />
                    {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 rounded-xl border p-4 mb-4 transition-all
                    ${isActive
                      ? 'bg-white border-primary/25 shadow-sm shadow-primary/5'
                      : 'bg-slate-50/70 border-outline-variant'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={entry.assignedTo?.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-heading leading-tight truncate">
                            {entry.assignedTo?.fullName}
                          </p>
                          <p className="text-[10px] text-text-body opacity-50 font-bold uppercase tracking-wider mt-0.5">
                            {entry.assignedTo?.role?.replace('ROLE_', '')}
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-primary bg-primary-light/60 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                          <CheckCircle2 size={9} /> Active
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-text-body bg-slate-100 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-outline-variant opacity-60">
                          <XCircle size={9} /> Returned
                        </span>
                      )}
                    </div>

                    {/* Date row */}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-text-body opacity-30 shrink-0" />
                        <span className="text-[11px] font-bold text-text-heading">
                          {fmt(entry.allocatedAt)}
                        </span>
                      </div>

                      {entry.deallocatedAt && (
                        <>
                          <div className="flex items-center gap-1 text-text-body opacity-30">
                            <ArrowRight size={10} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RotateCcw size={11} className="text-text-body opacity-30 shrink-0" />
                            <span className="text-[11px] font-bold text-text-body opacity-70">
                              {fmt(entry.deallocatedAt)}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <Timer size={11} className="text-text-body opacity-30 shrink-0" />
                        <span className="text-[11px] font-bold text-text-body opacity-60">
                          {durationLabel(entry.allocatedAt, entry.deallocatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-outline-variant px-6 py-3 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="p-1.5 rounded-lg border border-outline-variant bg-white text-text-body disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-text-body uppercase tracking-wider opacity-60">
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="p-1.5 rounded-lg border border-outline-variant bg-white text-text-body disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────

const AllocationList = () => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="space-y-6 font-sans">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-extrabold text-text-heading tracking-tight">
          Allocation Audit
        </h2>
        <p className="text-text-body text-sm mt-1 font-medium opacity-70">
          Browse allocated hardware and inspect the full custody chain for any device.
        </p>
      </div>

      {/* Split panel */}
      <div className="flex gap-5 h-[calc(100vh-220px)] min-h-[520px]">
        {/* LEFT — device list */}
        <Card
          padding="p-0"
          className="w-80 shrink-0 overflow-hidden border-outline-variant shadow-sm flex flex-col"
        >
          <DeviceListPanel
            selectedId={selectedAsset?.id}
            onSelect={setSelectedAsset}
          />
        </Card>

        {/* RIGHT — history detail */}
        <Card
          padding="p-0"
          className="flex-1 overflow-hidden border-outline-variant shadow-sm flex flex-col"
        >
          <HistoryPanel asset={selectedAsset} />
        </Card>
      </div>
    </div>
  );
};

export default AllocationList;