import { ShieldCheck, Users, FileText, BarChart2, UserX } from 'lucide-react';
import { authStore } from '../auth/authStore';
import type { JCSession } from '../types';

interface AdminProps { session: JCSession | null; navigate: (s: string) => void; }

export default function Admin({ session }: AdminProps) {
  if (session?.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto jc-card text-center py-16">
        <ShieldCheck size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="font-bold text-slate-700 text-lg">Access Denied</h3>
        <p className="text-slate-500 text-sm mt-2">Admin panel is only accessible to Mounik Pani.</p>
      </div>
    );
  }

  const allUsers = authStore.getAllUsers();
  const activeUsers = allUsers.filter(u => u.status !== 'deleted');
  const deletedUsers = allUsers.filter(u => u.status === 'deleted');
  const allCases = authStore.getAllCases().slice(0, 20);
  const { totalCases } = authStore.getTotalStats();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="jc-section-banner flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl shrink-0">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-jc-gold-300 uppercase tracking-widest mb-1">Administration</div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-white/70 text-sm mt-1">System overview and user management</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: activeUsers.length, icon: <Users size={22} className="text-jc-purple-600" /> },
          { label: 'Deleted Users', value: deletedUsers.length, icon: <UserX size={22} className="text-red-400" /> },
          { label: 'Total Cases', value: totalCases, icon: <FileText size={22} className="text-jc-gold-600" /> },
          { label: 'Remedies in DB', value: 700, icon: <BarChart2 size={22} className="text-emerald-600" /> },
        ].map(s => (
          <div key={s.label} className="jc-card flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl shrink-0">{s.icon}</div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="jc-card overflow-x-auto">
        <h3 className="font-semibold text-slate-700 mb-4">All Users</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Phone</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2 pr-4">Cases</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u, i) => (
              <tr key={u.phone} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                <td className="py-2 pr-4 font-medium text-slate-700">{u.name}</td>
                <td className="py-2 pr-4 text-slate-500">+91 {u.phone}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    u.role === 'admin' ? 'bg-jc-purple-100 text-jc-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-2 pr-4 text-slate-500">{u.cases?.length ?? 0}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    u.status === 'deleted' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {u.status === 'deleted' ? 'Deleted' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent cases */}
      {allCases.length > 0 && (
        <div className="jc-card overflow-x-auto">
          <h3 className="font-semibold text-slate-700 mb-4">Recent Cases (up to 20)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Complaint</th>
                <th className="pb-2">Top Remedy</th>
              </tr>
            </thead>
            <tbody>
              {allCases.map((c, i) => (
                <tr key={c.case.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                  <td className="py-2 pr-4 font-medium text-slate-700">{c.user}</td>
                  <td className="py-2 pr-4 text-slate-500">
                    {new Date(c.case.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{c.case.complaint}</td>
                  <td className="py-2">
                    {c.case.topRemedy
                      ? <span className="jc-badge-probable">{c.case.topRemedy}</span>
                      : <span className="text-slate-400">-</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
