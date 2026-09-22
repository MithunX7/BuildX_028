import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    setUpdatingId(user._id);
    try {
      await adminService.updateUserStatus(user._id, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-400" />
            User Access & Role Management ({users.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage citizen accounts, field contractors, and municipal administrative permissions.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh users"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Citizens (USER)</option>
          <option value="ADMIN">Administrators (ADMIN)</option>
          <option value="COMMANDER">Commander</option>
          <option value="COORDINATOR">Coordinator</option>
          <option value="INSPECTOR">Inspector / Contractor</option>
          <option value="VERIFIER">Verifier</option>
        </select>
      </div>

      {/* Users Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading users registry...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No users found matching your search.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user._id}
              className="p-4 sm:p-5 rounded-2xl bg-[#111c44] border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-base flex-shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">{user.name}</h3>
                    <Badge
                      variant={user.role === 'ADMIN' || user.role === 'COMMANDER' ? 'danger' : 'info'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                    <Badge variant={user.isActive ? 'success' : 'default'} size="sm">
                      {user.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" /> {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" /> {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <Button
                  size="sm"
                  variant={user.isActive ? 'secondary' : 'success'}
                  onClick={() => handleToggleStatus(user)}
                  isLoading={updatingId === user._id}
                >
                  {user.isActive ? 'Suspend Access' : 'Activate User'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
