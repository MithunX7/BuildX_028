import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Clock,
  UserCheck,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.actorName?.toLowerCase().includes(q) ||
      log.entityType?.toLowerCase().includes(q) ||
      log.entityId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-sky-400" />
            System Audit Trail & Governance Logs ({logs.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable chronological record of all operational actions, priority overrides, contractor dispatches, and verification approvals.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all self-start sm:self-auto"
          title="Refresh audit logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit logs by action, officer name, or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          Loading system audit trail...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-[#111c44] rounded-3xl border border-slate-800">
          No audit log entries found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((log) => (
            <div
              key={log._id}
              className="p-4 rounded-2xl bg-[#111c44] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" size="sm">
                    {log.entityType}
                  </Badge>
                  <span className="font-bold text-white font-mono">{log.action?.replace(/_/g, ' ')}</span>
                </div>

                <div className="text-slate-400 text-[11px] flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-300">
                    <UserCheck className="w-3 h-3 text-blue-400" /> {log.actorName}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">Entity: {log.entityId}</span>
                </div>
              </div>

              <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
