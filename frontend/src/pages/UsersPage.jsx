import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  Shield, 
  Mail, 
  Clock,
  UserCheck,
  UserX,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { userService } from '../api/services/users';
import { useAuth, useDeleteUser } from '../hooks/useAssetTrack';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import ActionModal from '../components/common/ActionModal';
import GlobalErrorAlert from '../components/errors/GlobalErrorAlert';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Modal state
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, payload: null });

  // Delete hook
  const { deleteUser, loading: deleting, error: deleteError, clearError: clearDeleteError } = useDeleteUser();

  // Pagination & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.list({ page, size: 10 });
      setUsers(response.content);
      setTotalItems(response.meta.totalElements);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setModalConfig({ isOpen: true, type: 'USER', payload: null });
  };

  const handleEditUser = (user) => {
    setModalConfig({ isOpen: true, type: 'USER', payload: user });
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own administrative account.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user ${userEmail}? This action cannot be undone.`)) {
      clearDeleteError();
      setSuccessMessage(null);
      
      const success = await deleteUser(userId);
      
      if (success) {
        setSuccessMessage(`User ${userEmail} deleted successfully.`);
        fetchUsers();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <Badge variant="danger">Admin</Badge>;
      case 'MANAGER': return <Badge variant="warning">Manager</Badge>;
      default: return <Badge variant="info">Developer</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredUsers = users.filter(u => 
    !searchQuery || 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-heading leading-tight tracking-tight">User Management</h1>
          <p className="text-text-body mt-2 font-medium">Control organizational access, roles, and account statuses.</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <Button variant="primary" onClick={handleAddUser} icon={UserPlus} className="shadow-xl px-8 py-3">
            Add New Member
          </Button>
        )}
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 animate-in slide-in-from-top-2">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-bold text-sm">Could not delete user</p>
            <p className="text-sm opacity-90">
              {deleteError.status === 409 || (deleteError.status === 500 && deleteError.message === "An unexpected error occurred")
                ? "This user has active or historical asset allocations and cannot be deleted. Try deactivating the account instead." 
                : deleteError.message || "An unexpected error occurred."}
            </p>
            <button onClick={clearDeleteError} className="mt-2 text-xs font-bold uppercase tracking-widest hover:underline">Dismiss</button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <p className="font-bold text-sm">{successMessage}</p>
        </div>
      )}

      {/* Filter Bar */}
      <Card padding="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search current page by name or email..." 
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchUsers} className="px-10">
            <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </Button>
        </div>
      </Card>

      {/* Table Section */}
      <Card padding="p-0" className="overflow-hidden shadow-sm border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-5 px-8 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="py-5 px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Role</th>
                <th className="py-5 px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="py-5 px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Date Joined</th>
                <th className="py-5 px-8 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-text-body uppercase tracking-widest opacity-50">Syncing Members...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center text-text-body font-medium italic opacity-60">No members found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group/item"
                        onClick={() => navigate(`/users/${u.id}/profile`)}
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center text-primary font-black shadow-inner border border-primary/5 group-hover/item:scale-110 transition-transform">
                          {u.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-text-heading text-[15px] truncate group-hover/item:text-primary transition-colors">{u.fullName}</span>
                          <span className="text-xs text-text-body flex items-center gap-1 font-medium opacity-70">
                            <Mail size={12} className="opacity-40" /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="flex justify-center">
                        {u.active ? (
                          <div className="flex items-center gap-1.5 text-[#28A745] font-black text-[10px] uppercase tracking-widest bg-[#EAF7ED] px-2.5 py-1 rounded-full border border-[#28A745]/10">
                            <UserCheck size={12} /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-text-body opacity-40 font-black text-[10px] uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full border border-outline-variant">
                            <UserX size={12} /> Disabled
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2 text-[13px] text-text-body font-bold opacity-80">
                        <Clock size={14} className="opacity-30" /> {formatDate(u.createdAt)}
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      {currentUser?.role === 'ADMIN' && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditUser(u)}
                            className="p-2.5 text-gray-400 hover:text-primary transition-all hover:bg-white rounded-xl hover:shadow-md border border-transparent hover:border-outline-variant"
                            title="Edit Profile"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-2.5 text-gray-400 hover:text-danger transition-all hover:bg-red-50 rounded-xl hover:shadow-sm border border-transparent hover:border-danger/10"
                            title="Delete Member"
                            disabled={deleting}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="bg-slate-50 border-t border-outline-variant px-8 py-5 flex items-center justify-between">
          <span className="text-sm text-text-body font-bold opacity-70">
            Showing <span className="text-text-heading">{filteredUsers.length}</span> — members on this page
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-5 text-sm font-black text-text-heading uppercase tracking-tighter">
              Page {page + 1} / {totalPages || 1}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>

      <ActionModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        payload={modalConfig.payload}
        onRefresh={fetchUsers}
      />
    </div>
  );
};

export default UsersPage;
