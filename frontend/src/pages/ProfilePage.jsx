import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Save, 
  ChevronLeft,
  Calendar,
  ShieldCheck,
  Clock,
  Edit2,
  RefreshCcw,
  AlertCircle,
  Laptop,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  HardDrive,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../hooks/api/useAuth';
import { useUpdateUser } from '../hooks/api/useUsers';
import { userService } from '../api/services/users';
import { authService } from '../api/services/auth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';
import StatusBadge from '../components/common/StatusBadge';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // If no userId in path, we are viewing our own profile
  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetId = userId || currentUser?.id;

  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchAttempted = useRef(false);

  // Admin form state
  const [adminForm, setUserForm] = useState({ fullName: '', active: true, role: '' });
  const [successMessage, setSuccessMessage] = useState(null);

  const { updateUser, loading: userUpdating, error: userError } = useUpdateUser();

  const fetchProfile = useCallback(async () => {
    // Prevent multiple concurrent fetches if state updates trigger rerenders
    if (loading && fetchAttempted.current) return;
    
    setLoading(true);
    setError(null);
    fetchAttempted.current = true;

    try {
      let userData;
      if (isOwnProfile) {
        userData = await authService.me();
      } else {
        userData = await userService.getById(targetId);
      }

      if (!userData) {
        throw new Error("Received empty response from profile service.");
      }

      setUser(userData);
      setUserForm({ 
        fullName: userData.fullName || '', 
        active: userData.active ?? true,
        role: userData.role || ''
      });

      // Fetch assets assigned to this user
      setAssetsLoading(true);
      try {
        const assetsData = await userService.getAssets(targetId, { size: 10 });
        setAssets(assetsData?.content || []);
      } catch (assetErr) {
        console.error("Failed to fetch user assets", assetErr);
        setAssets([]);
      } finally {
        setAssetsLoading(false);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
      fetchAttempted.current = false;
    }
  }, [targetId, isOwnProfile]);

  useEffect(() => {
    if (targetId) {
      fetchProfile();
    }
  }, [targetId, fetchProfile]);

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateUser({ 
        userId: targetId, 
        body: { 
          fullName: adminForm.fullName,
          active: adminForm.active
        } 
      });
      
      if (result && adminForm.role !== user?.role) {
        await userService.updateRole(targetId, adminForm.role);
      }

      if (result) {
        setSuccessMessage("User profile updated successfully.");
        fetchProfile();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error("Admin update failed", err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LAPTOP': return <Laptop size={16} />;
      case 'MONITOR': return <Monitor size={16} />;
      case 'KEYBOARD': return <Keyboard size={16} />;
      case 'MOUSE': return <Mouse size={16} />;
      case 'HEADSET': return <Headphones size={16} />;
      default: return <HardDrive size={16} />;
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-text-body">
        <RefreshCcw className="animate-spin text-primary" size={32} />
        <p className="font-bold uppercase tracking-widest text-[10px] opacity-40">Synchronizing Identity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-danger-expired/30 shadow-2xl shadow-danger-expired/5">
          <div className="flex flex-col items-center text-center space-y-6 py-8 px-4">
            <div className="w-20 h-20 rounded-3xl bg-danger-expired/10 flex items-center justify-center text-danger-expired shadow-inner rotate-3">
              <Shield size={40} strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text-heading uppercase tracking-tight">Identity Sync Failed</h2>
              <p className="text-sm text-text-body font-medium opacity-70 leading-relaxed max-w-xs mx-auto">
                The database returned an invalid response for this identity record.
              </p>
            </div>
            <div className="w-full">
              <GlobalErrorAlert error={error} />
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => navigate(-1)} icon={ChevronLeft}>Return</Button>
              <Button variant="primary" onClick={() => fetchProfile()} icon={RefreshCcw}>Retry Sync</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4 space-y-10 font-sans max-w-6xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          {!isOwnProfile && (
            <button onClick={() => navigate('/users')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5 hover:opacity-70 transition-all group">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Directory
            </button>
          )}
          <h1 className="text-4xl font-black text-text-heading tracking-tight m-0">
            {isOwnProfile ? 'Account Intelligence' : 'Member Authority'}
          </h1>
          <p className="text-text-body text-sm font-medium opacity-50">
            {isOwnProfile ? 'Your platform credentials and system presence.' : `Full administrative control for ${user.fullName}.`}
          </p>
        </div>
        {!user.active && (
          <div className="flex items-center gap-2 bg-danger-expired/5 border border-danger-expired/20 px-4 py-2 rounded-2xl text-danger-expired">
            <AlertCircle size={16} />
            <span className="text-xs font-black uppercase tracking-widest">Access Restricted</span>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <ShieldCheck size={18} />
          <p className="font-bold text-sm tracking-tight">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Profile Summary */}
        <div className="space-y-6">
          <Card className="text-center py-12 border-outline-variant shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 group-hover:h-36 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-28 h-28 rounded-[2rem] bg-white shadow-2xl border border-outline-variant flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-105 duration-300">
                <UserIcon size={56} className="text-primary opacity-20" />
              </div>
              <h2 className="text-2xl font-black text-text-heading mb-1 tracking-tight">{user.fullName}</h2>
              <div className="flex justify-center gap-2 mb-8">
                <Badge variant={user.role === 'ADMIN' ? 'danger' : 'primary'} className="text-[10px] px-3 font-black uppercase tracking-widest">{user.role}</Badge>
              </div>
              
              <div className="space-y-4 px-8 text-left border-t border-outline-variant pt-8">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-text-body opacity-40 uppercase tracking-widest">Identity Identifier</p>
                  <div className="flex items-center gap-2.5 text-[13px] text-text-heading font-bold truncate">
                    <Mail size={14} className="text-primary flex-shrink-0" /> {user.email}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-text-body opacity-40 uppercase tracking-widest">System Hash ID</p>
                  <div className="text-[11px] font-mono text-text-body opacity-60 truncate bg-slate-50 px-2 py-1 rounded-md">{user.id}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-text-body opacity-40 uppercase tracking-widest">Enrollment Cycle</p>
                  <div className="flex items-center gap-2.5 text-[13px] text-text-heading font-bold">
                    <Calendar size={14} className="text-primary flex-shrink-0" /> {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats / Info */}
          <Card className="p-6 border-outline-variant">
            <h3 className="text-[10px] font-black text-text-body opacity-40 uppercase tracking-[0.2em] mb-4">System Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-text-body">
                  <Laptop size={14} className="opacity-40" /> Assigned Assets
                </div>
                <span className="text-sm font-black text-text-heading">{assets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-text-body">
                  <ShieldCheck size={14} className="opacity-40" /> Profile Status
                </div>
                <Badge variant={user.active ? 'success' : 'neutral'} className="text-[9px]">{user.active ? 'VERIFIED' : 'SUSPENDED'}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Admin Control Section */}
          {isAdmin && (
            <Card className="border-primary/20 shadow-xl shadow-primary/5 ring-1 ring-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant relative z-10">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Shield size={16} /> Data Override
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Admin Session</span>
                </div>
              </div>
              
              <form onSubmit={handleAdminUpdate} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="SYSTEM DISPLAY NAME" 
                    icon={Edit2}
                    value={adminForm.fullName}
                    onChange={(e) => setUserForm(p => ({ ...p, fullName: e.target.value }))}
                  />
                  <div className="flex flex-col space-y-2">
                    <label className="text-[11px] font-black text-text-body opacity-50 uppercase tracking-[0.15em]">Assigned Logic Role</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-50 border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                        value={adminForm.role}
                        onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
                      >
                        <option value="ADMIN">ADMINISTRATOR</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                        <ChevronLeft className="-rotate-90" size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-slate-50/50 rounded-[2rem] border border-outline-variant/50 transition-all hover:bg-slate-50 hover:border-outline-variant group">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="acc-active"
                      checked={adminForm.active}
                      onChange={(e) => setUserForm(p => ({ ...p, active: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                  </div>
                  <label htmlFor="acc-active" className="flex flex-col cursor-pointer select-none">
                    <span className="text-sm font-black text-text-heading uppercase tracking-tight group-hover:text-primary transition-colors">Access Logic Enabled</span>
                    <span className="text-[10px] text-text-body font-medium opacity-50">Determines if this identity can interact with the system APIs.</span>
                  </label>
                </div>

                {userError && <GlobalErrorAlert error={userError} />}

                <div className="flex justify-end pt-4">
                  <Button 
                    variant="primary" 
                    icon={Save} 
                    type="submit" 
                    loading={userUpdating} 
                    className="px-12 py-4 shadow-2xl shadow-primary/30 text-xs tracking-[0.2em] uppercase font-black"
                  >
                    Commit Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Hardware Assets Section */}
          <Card className="border-outline-variant relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant">
              <h3 className="text-xs font-black text-text-heading uppercase tracking-[0.3em] flex items-center gap-2">
                <Laptop size={16} /> Hardware Inventory
              </h3>
              <span className="text-[10px] font-bold text-text-body opacity-40 uppercase tracking-widest">In Custody</span>
            </div>

            {assetsLoading ? (
              <div className="flex flex-col items-center py-12 gap-3 opacity-30">
                <RefreshCcw className="animate-spin" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest">Scanning Network...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-dashed border-outline-variant flex items-center justify-center mx-auto opacity-40">
                  <ExternalLink size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-text-heading">No assets currently allocated.</p>
                  <p className="text-[11px] text-text-body font-medium opacity-50 leading-relaxed max-w-xs mx-auto">
                    There are no hardware records linked to this identity in the central database.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-2xl border border-outline-variant bg-slate-50/30 hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group cursor-pointer" onClick={() => navigate(`/assets?search=${asset.serialNumber}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-outline-variant flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {getTypeIcon(asset.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-text-heading text-[13px] truncate">{asset.brand} {asset.model}</span>
                          <StatusBadge status={asset.status} size="sm" />
                        </div>
                        <div className="text-[10px] font-mono text-text-body opacity-60 uppercase tracking-tighter truncate">SN: {asset.serialNumber}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Standard User Info Block (if not admin) */}
          {!isAdmin && (
            <Card className="flex flex-col items-center justify-center py-16 text-center space-y-6 bg-slate-50/20 border-dashed border-outline-variant">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-primary/30 border border-outline-variant">
                <Shield size={32} strokeWidth={1.5} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-sm font-black text-text-heading uppercase tracking-widest">Protected Identity Context</h3>
                <p className="text-xs text-text-body font-medium leading-relaxed opacity-60">
                  Profile data and account roles are cryptographically locked to preserve system integrity. Modifications require administrative escalation.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest hover:bg-white border border-transparent hover:border-outline-variant">Change Password</Button>
                  <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest hover:bg-white border border-transparent hover:border-outline-variant">Update Email</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
