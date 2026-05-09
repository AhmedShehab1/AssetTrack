import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserMinus,
  Trash2,
  Mail,
  Calendar
} from 'lucide-react';
import { useUsers, useUpdateUser, useUpdateUserRole, useDeleteUser } from '../../hooks/api/useUsers';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Badge from '../common/Badge';

const UserList = () => {
  const { fetchUsers, loading, users, meta } = useUsers();
  const { updateUser } = useUpdateUser();
  const { updateUserRole } = useUpdateUserRole();
  const { deleteUser } = useDeleteUser();

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    active: ''
  });
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchUsers({
      page,
      size: 10,
      search: filters.search || undefined,
      role: filters.role || undefined,
      active: filters.active === '' ? undefined : filters.active === 'true'
    });
  }, [page, filters.role, filters.active]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      fetchUsers({
        page: 0,
        size: 10,
        search: filters.search || undefined,
        role: filters.role || undefined,
        active: filters.active === '' ? undefined : filters.active === 'true'
      });
    }
  };

  const toggleUserStatus = async (user) => {
    const success = await updateUser(user.id, { active: !user.active });
    if (success) fetchUsers({ page, size: 10 });
  };

  const changeUserRole = async (userId, newRole) => {
    const success = await updateUserRole(userId, { role: newRole });
    if (success) fetchUsers({ page, size: 10 });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = await deleteUser(userId);
      if (success) fetchUsers({ page, size: 10 });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck size={16} className="text-danger" />;
      case 'MANAGER': return <Shield size={16} className="text-warning" />;
      default: return <UserIcon size={16} className="text-primary" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-text-heading">User Management</h2>
          <p className="text-text-body text-sm mt-1 font-medium">Manage organization members, roles, and access permissions.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card padding="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input 
            label="Search Users" 
            name="search"
            placeholder="Search by name or email..." 
            icon={Search}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            onKeyDown={handleSearch}
          />
          
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Role</label>
            <select 
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="DEVELOPER">Developer</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</label>
            <select 
              value={filters.active}
              onChange={(e) => setFilters({...filters, active: e.target.value})}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-body font-medium">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-body font-medium">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold border border-primary/10">
                          {user.fullName?.split(' ').map(n => n[0]).join('') || <UserIcon size={18} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-heading text-sm">{user.fullName}</span>
                          <span className="text-xs text-text-body flex items-center gap-1">
                            <Mail size={12} /> {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <select 
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value)}
                          className="bg-transparent border-none text-sm font-semibold text-text-body focus:ring-0 p-0 cursor-pointer hover:text-primary"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="DEVELOPER">Developer</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={user.active ? 'success' : 'neutral'}>
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-body">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className={`p-1.5 rounded-lg border border-transparent transition-all ${user.active ? 'text-warning hover:bg-warning/10 hover:border-warning/20' : 'text-success hover:bg-success/10 hover:border-success/20'}`}
                          title={user.active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.active ? <UserMinus size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-gray-400 hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {meta && (
          <div className="bg-slate-50 border-t border-outline-variant px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-text-body font-medium">
              Showing <span className="font-bold text-text-heading">{users.length > 0 ? page * 10 + 1 : 0}</span> to <span className="font-bold text-text-heading">{Math.min((page + 1) * 10, meta.totalElements)}</span> of <span className="font-bold text-text-heading">{meta.totalElements}</span> users
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 text-sm font-bold text-text-heading">
                Page {page + 1} of {meta.totalPages || 1}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages - 1, p + 1))}
                disabled={page >= meta.totalPages - 1 || loading}
                className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserList;
