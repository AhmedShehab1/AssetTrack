import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Save, User as UserIcon } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useCreateUser, useUpdateUserStatus, useUpdateUserRole } from '../../hooks/api/useUsers';
import { UserRole } from '../../api/types';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';

const UserForm = ({ user, onClose, onRefresh }) => {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'DEVELOPER',
    active: true
  });

  const { createUser, loading: creating, error: createError } = useCreateUser();
  const { updateStatus, loading: statusUpdating, error: statusError } = useUpdateUserStatus();
  const { updateRole, loading: roleUpdating, error: roleError } = useUpdateUserRole();

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        password: '', 
        role: user.role || 'DEVELOPER',
        active: user.active ?? true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;

    if (isEdit) {
      // 1. Update Role if changed
      let roleResult = true;
      if (formData.role !== user.role) {
        roleResult = !!(await updateRole({ userId: user.id, role: formData.role }));
      }
      
      // 2. Update Status if changed
      let statusResult = true;
      if (formData.active !== user.active) {
        statusResult = !!(await updateStatus({ userId: user.id, active: formData.active }));
      }
      
      success = roleResult && statusResult;
    } else {
      const result = await createUser(formData);
      success = !!result;
    }

    if (success) {
      onRefresh?.();
      onClose();
    }
  };

  const error = createError || statusError || roleError;
  const loading = creating || statusUpdating || roleUpdating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans pb-10">
      {error && <GlobalErrorAlert error={error} />}

      <div className="space-y-5">
        <Input 
          label="FULL NAME"
          name="fullName"
          required
          disabled={isEdit}
          icon={UserIcon}
          placeholder="Jane Doe"
          value={formData.fullName}
          onChange={handleChange}
        />

        <Input 
          label="WORK EMAIL"
          name="email"
          type="email"
          required
          disabled={isEdit}
          icon={Mail}
          placeholder="jane@company.com"
          value={formData.email}
          onChange={handleChange}
        />

        {!isEdit && (
          <Input 
            label="INITIAL PASSWORD"
            name="password"
            type="password"
            required
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        )}

        <div className="flex flex-col space-y-1.5 w-full">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Organizational Role</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Shield size={18} />
            </div>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-10 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {isEdit && (
          <label className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-outline-variant cursor-pointer hover:border-primary/20 transition-all shadow-inner">
            <input 
              type="checkbox" 
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <p className="text-sm font-bold text-text-heading uppercase tracking-tight">Account Active</p>
              <p className="text-[10px] text-text-body font-medium opacity-60">Allow this user to sign in and access the platform</p>
            </div>
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-8 border-t border-outline-variant mt-10">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          disabled={loading}
          className="flex-1 !py-4 rounded-2xl font-bold"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          icon={Save} 
          loading={loading} 
          disabled={loading}
          className="flex-[2] !py-4 rounded-2xl shadow-xl shadow-primary/20 font-bold"
        >
          {isEdit ? 'Save Changes' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
