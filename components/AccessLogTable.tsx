
import React from 'react';
import { AccessLog, AccessStatus, AccessType } from '../types';
// Fix: Added missing Database icon import
import { MapPin, Mail, CheckCircle2, ShieldAlert, Database } from 'lucide-react';

interface AccessLogTableProps {
  logs: AccessLog[];
}

const AccessLogTable: React.FC<AccessLogTableProps> = ({ logs }) => {
  const getStatusColor = (status: AccessStatus) => {
    switch (status) {
      case AccessStatus.GRANTED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case AccessStatus.DENIED: return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  const getMethodIcon = (method: AccessType) => {
    switch (method) {
      case AccessType.FINGERPRINT: return '☝️';
      case AccessType.RFID_CARD: return '🪪';
      case AccessType.PASSCODE: return '🔢';
      case AccessType.FACE: return '👤';
      default: return '❓';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden h-full flex flex-col shadow-2xl">
      <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
        <div>
          <h3 className="font-bold text-zinc-100 text-sm uppercase tracking-wide">Traffic Feed</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Unified Hardware Log from F22 Nodes</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold">
           <span className="flex items-center gap-1.5 text-emerald-500">
             <CheckCircle2 className="w-3.5 h-3.5" />
             SQL PERSISTED
           </span>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
        <table className="w-full text-left text-sm border-separate border-spacing-0">
          <thead className="bg-zinc-950/80 sticky top-0 text-zinc-500 uppercase text-[10px] font-black tracking-widest z-10">
            <tr>
              <th className="px-5 py-4 font-black">Time</th>
              <th className="px-5 py-4 font-black">Subject Profile</th>
              <th className="px-5 py-4 font-black">Hardware Terminal</th>
              <th className="px-5 py-4 font-black">Type</th>
              <th className="px-5 py-4 font-black">Status</th>
              <th className="px-5 py-4 font-black text-center">Alerted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-800/20 transition-all group">
                <td className="px-5 py-4 mono text-[11px] text-zinc-500 font-medium">
                  {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-bold text-xs">{log.userName}</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight">{log.department}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5 text-zinc-400">
                    <div className="p-1.5 bg-zinc-800 rounded-md">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-300">{log.deviceInfo?.name}</span>
                      <span className="text-[9px] text-zinc-600 font-mono">{log.deviceInfo?.ipAddress}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" title={log.method}>{getMethodIcon(log.method)}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${getStatusColor(log.status)}`}>
                    {log.status === AccessStatus.DENIED && <ShieldAlert className="w-3 h-3" />}
                    {log.status}
                  </div>
                </td>
                <td className="px-5 py-4">
                   <div className="flex justify-center">
                     {log.notificationSent ? (
                       <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10 group-hover:scale-110 transition-transform">
                         <Mail className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-black uppercase tracking-tighter">Sent</span>
                       </div>
                     ) : (
                       <span className="text-zinc-800 text-[10px] font-black opacity-20">—</span>
                     )}
                   </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-24 text-center">
                  <div className="flex flex-col items-center">
                    {/* Fix: Database component is now imported correctly */}
                    <Database className="w-8 h-8 text-zinc-800 mb-3 animate-pulse" />
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Awaiting SQL Log Stream...</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessLogTable;
