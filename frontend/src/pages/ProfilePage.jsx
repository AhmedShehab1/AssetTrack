import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lock, 
  Save, 
  Laptop, 
  ChevronLeft,
  Calendar,
  ShieldCheck,
  ToggleLeft as Toggle,
  AlertCircle,
  Clock,
  Edit2
} from 'lucide-react';
import { useAuth, useUpdateEmail, useChangePassword } from '../hooks/api/useAuth';
import { useUpdateUser, useUserAssets } from '../hooks/api/useUsers';
import { userService } from '../api/services/users';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/common/StatusBadge';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

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
  const [error, setError] = useState(null);

  // Form states
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [adminForm, setUserForm] = useState({ fullName: '', active: true, role: '' });
  
  const [successMessage, setSuccessMessage] = useState(null);

  const { updateEmail, loading: emailUpdating, error: emailError } = useUpdateEmail();
  const { changePassword, loading: passwordUpdating, error: passwordError } = useChangePassword();
  const { updateUser, loading: userUpdating, error: userError } = useUpdateUser();
  const { getUserAssets } = useUserAssets();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getById(targetId);
      setUser(userData);
      setEmailForm({ email: userData.email });
      setUserForm({ 
        fullName: userData.fullName || '', 
        active: userData.active,
        role: userData.role
      });

      const assetsData = await getUserAssets({ userId: targetId });
      setAssets(assetsData.content || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [targetId, getUserAssets]);

  useEffect(() => {
    if (targetId) {
      fetchProfile();
    }
  }, [targetId, fetchProfile]);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    const result = await updateEmail(emailForm);
    if (result) {
      setSuccessMessage("Email updated successfully.");
      fetchProfile();
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    if (result) {
      setSuccessMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    const result = await updateUser({ 
      userId: targetId, 
      body: { 
        fullName: adminForm.fullName,
        active: adminForm.active
      } 
    });
    
    // Also update role if changed (backend has specific endpoint)
    if (result && adminForm.role !== user.role) {
      await userService.updateRole(targetId, adminForm.role);
    }

    if (result) {
      setSuccessMessage("User profile updated by administrator.");
      fetchProfile();
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  if (loading && !user) {
    return <div className="p-20 text-center font-sans uppercase tracking-widest opacity-40 animate-pulse">Synchronizing Profile...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <GlobalErrorAlert error={error} />
        <Button variant="outline" onClick={() => navigate(-1)} icon={ChevronLeft} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-10 font-sans max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          {!isOwnProfile && (
            <button onClick={() => navigate('/users')} className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity">
              <ChevronLeft size={14} /> Back to Members
            </button>
          )}
          <h1 className="text-3xl font-black text-text-heading tracking-tight m-0">
            {isOwnProfile ? 'My Account Profile' : 'Member Authority Control'}
          </h1>
          <p className="text-text-body text-sm font-medium opacity-70">
            {isOwnProfile ? 'Manage your personal details and security credentials.' : `Managing permissions and profile for ${user.fullName}.`}
          </p>
        </div>
        {!user.active && <Badge variant="danger" className="px-4 py-1">Account Disabled</Badge>}
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-2">
          <ShieldCheck size={18} />
          <p className="font-bold text-sm">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Profile Summary */}
        <div className="space-y-6">
          <Card className="text-center py-10 border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary/5"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-outline-variant flex items-center justify-center mx-auto mb-6 group transition-transform hover:scale-105">
                <UserIcon size={48} className="text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
              </div>
              <h2 className="text-xl font-black text-text-heading mb-1">{user.fullName}</h2>
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-6">{user.role}</p>
              
              <div className="space-y-3 px-6 text-left border-t border-outline-variant pt-6">
                <div className="flex items-center gap-3 text-xs text-text-body font-medium">
                  <Mail size={14} className="opacity-40" /> {user.email}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-body font-medium">
                  <Clock size={14} className="opacity-40" /> Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="p-0" className="overflow-hidden border-outline-variant shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-outline-variant flex items-center gap-2">
              <Laptop size={16} className="text-primary" />
              <h3 className="text-xs font-black text-text-heading uppercase tracking-widest">Active Hardware</h3>
            </div>
            <div className="divide-y divide-outline-variant">
              {assets.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-body font-bold opacity-30 italic">No assets currently allocated.</div>
              ) : (
                assets.map(asset => (
                  <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-outline-variant shadow-sm">
                        <Laptop size={14} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-text-heading">{asset.brand} {asset.model}</div>
                        <div className="text-[10px] font-mono text-text-body opacity-50 uppercase">{asset.serialNumber}</div>
                      </div>
                    </div>
                    <StatusBadge status={asset.status} className="scale-[0.8] origin-right" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Main: Settings Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Admin Control Section */}
          {isAdmin && (
            <Card className="border-primary/20 shadow-lg shadow-primary/5">
              <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Shield size={16} /> Administrative Override
              </h3>
              <form onSubmit={handleAdminUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="DISPLAY NAME" 
                    icon={Edit2}
                    value={adminForm.fullName}
                    onChange={(e) => setUserForm(p => ({ ...p, fullName: e.target.value }))}
                  />
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">System Role</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                      value={adminForm.role}
                      onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="DEVELOPER">DEVELOPER</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-outline-variant shadow-inner">
                  <input 
                    type="checkbox" 
                    id="acc-active"
                    checked={adminForm.active}
                    onChange={(e) => setUserForm(p => ({ ...p, active: e.target.checked }))}
                    className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="acc-active" className="flex flex-col cursor-pointer">
                    <span className="text-sm font-bold text-text-heading uppercase tracking-tight">Account Access Enabled</span>
                    <span className="text-[10px] text-text-body font-medium opacity-60">Disable to block all platform access for this member.</span>
                  </label>
                </div>
                <div className="flex justify-end pt-4">
                  <Button variant="primary" icon={Save} type="submit" loading={userUpdating} className="px-10 shadow-xl">Apply Administrative Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Self Service: Profile & Email */}
          {isOwnProfile && (
            <Card>
              <h3 className="text-sm font-black text-text-heading uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Mail size={16} className="text-primary" /> Profile Communication
              </h3>
              <form onSubmit={handleEmailUpdate} className="space-y-6">
                <Input 
                  label="PRIMARY WORK EMAIL" 
                  type="email" 
                  icon={Mail}
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ email: e.target.value })}
                  error={emailError?.message}
                />
                <div className="flex justify-end pt-4">
                  <Button variant="primary" icon={Save} type="submit" loading={emailUpdating} className="px-10 shadow-xl">Update Email</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Security: Password */}
          {isOwnProfile && (
            <Card>
              <h3 className="text-sm font-black text-text-heading uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Lock size={16} className="text-primary" /> Security Credentials
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <Input 
                  label="CURRENT PASSWORD" 
                  type="password" 
                  icon={Lock}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="NEW PASSWORD" 
                    type="password" 
                    icon={ShieldCheck}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  />
                  <Input 
                    label="CONFIRM NEW PASSWORD" 
                    type="password" 
                    icon={ShieldCheck}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                </div>
                {passwordError && <GlobalErrorAlert error={passwordError} />}
                <div className="flex justify-end pt-4">
                  <Button variant="primary" icon={Save} type="submit" loading={passwordUpdating} className="px-10 shadow-xl">Change Password</Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
