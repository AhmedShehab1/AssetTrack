import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Smartphone, 
  Save, 
  AlertCircle,
  Clock,
  RefreshCcw
} from 'lucide-react';
import { notificationService } from '../api/services/notifications';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const SettingsPage = () => {
  const [preferences, setPreferences] = useState({
    warrantyExpiryDaysThreshold: 30,
    lowStockThreshold: 5,
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await notificationService.getPreferences();
        if (data) setPreferences(data);
      } catch (err) {
        console.error("Failed to fetch preferences", err);
        // Fallback to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await notificationService.updatePreferences(preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-text-body font-medium flex items-center justify-center gap-3"><RefreshCcw className="animate-spin" /> Loading preferences...</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-text-heading flex items-center gap-3">
          <Settings size={32} className="text-primary" />
          Account Settings
        </h1>
        <p className="text-text-body mt-2">Manage your notification preferences and system thresholds.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && <GlobalErrorAlert error={error} onClose={() => setError(null)} />}
        
        {success && (
          <div className="bg-success-bg text-success p-4 rounded-xl border border-success/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Shield size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Preferences updated successfully</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notification Thresholds */}
          <Card padding="p-8" className="space-y-8">
            <div className="flex items-center gap-2.5 text-primary border-b border-outline-variant pb-4 mb-2">
              <Clock size={20} />
              <h3 className="font-extrabold uppercase tracking-widest text-xs">Threshold Alerts</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-text-body uppercase tracking-wider">
                  Warranty Expiry Warning (Days)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="365"
                  value={preferences.warrantyExpiryDaysThreshold}
                  onChange={(e) => setPreferences({...preferences, warrantyExpiryDaysThreshold: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl py-3 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
                <p className="text-[10px] text-text-body opacity-60 italic">Receive alerts N days before an asset's warranty expires.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-text-body uppercase tracking-wider">
                  Low Stock Threshold
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={preferences.lowStockThreshold}
                  onChange={(e) => setPreferences({...preferences, lowStockThreshold: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl py-3 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                />
                <p className="text-[10px] text-text-body opacity-60 italic">Alert when available asset categories fall below this count.</p>
              </div>
            </div>
          </Card>

          {/* Delivery Methods */}
          <Card padding="p-8" className="space-y-8">
            <div className="flex items-center gap-2.5 text-primary border-b border-outline-variant pb-4 mb-2">
              <Bell size={20} />
              <h3 className="font-extrabold uppercase tracking-widest text-xs">Delivery Methods</h3>
            </div>

            <div className="space-y-5">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-outline-variant cursor-pointer hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant group-hover:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-heading">Email Notifications</p>
                    <p className="text-[10px] text-text-body">Sent to your work address</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.emailNotificationsEnabled}
                  onChange={(e) => setPreferences({...preferences, emailNotificationsEnabled: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-outline-variant cursor-pointer hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant group-hover:scale-110 transition-transform">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-heading">In-App Notifications</p>
                    <p className="text-[10px] text-text-body">Alerts in the notification bell</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.inAppNotificationsEnabled}
                  onChange={(e) => setPreferences({...preferences, inAppNotificationsEnabled: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </label>
            </div>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            variant="primary" 
            icon={Save} 
            loading={saving}
            disabled={saving}
            className="px-12 py-4 shadow-xl"
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

