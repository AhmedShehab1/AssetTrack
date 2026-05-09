import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Mail, 
  Clock,
  UserCheck,
  UserX,
  Trash2,
  Edit3
} from 'lucide-react';
import { userService } from '../api/services/users';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.list({ 
        page, 
        size: 10,
        search: searchQuery || undefined
      });
      setUsers(response.content);
      setTotalItems(response.meta.totalElements);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <Badge variant="danger" icon={Shield}>Admin</Badge>;
      case 'MANAGER': return <Badge variant="warning">Manager</Badge>;
      default: return <Badge variant="info">Developer</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-heading leading-tight">User Management</h1>
          <p className="text-text-body mt-2 font-medium">Control organizational access, roles, and account statuses.</p>
        </div>
        <Button variant="primary" icon={UserPlus} className="shadow-xl">
          Add New User
        </Button>
      </div>

      {/* Filter Bar */}
      <Card padding="p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search by name or email..." 
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            />
          </div>
          <Button variant="outline" onClick={fetchUsers}>Apply Filters</Button>
        </div>
      </Card>

      {/* Table Section */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-outline-variant">
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-body">Loading members...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-body italic">No members found matching your search.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold shadow-sm">
                          {u.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-heading text-sm">{u.fullName}</span>
                          <span className="text-xs text-text-body flex items-center gap-1">
                            <Mail size={12} className="opacity-50" /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-4 px-4">
                      {u.active ? (
                        <div className="flex items-center gap-1.5 text-success font-bold text-[10px] uppercase tracking-widest">
                          <UserCheck size={14} /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-text-body opacity-50 font-bold text-[10px] uppercase tracking-widest">
                          <UserX size={14} /> Disabled
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-body font-medium">
                        <Clock size={14} className="opacity-40" /> {formatDate(u.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg">
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-danger transition-colors hover:bg-white rounded-lg">
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
        <div className="bg-slate-50 border-t border-outline-variant px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-text-body font-medium">
            Showing <span className="font-bold text-text-heading">{users.length > 0 ? page * 10 + 1 : 0}</span> to <span className="font-bold text-text-heading">{Math.min((page + 1) * 10, totalItems)}</span> of <span className="font-bold text-text-heading">{totalItems}</span> users
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
              Page {page + 1} of {totalPages || 1}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-2 rounded-xl border border-outline-variant bg-white text-text-body hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;
