
import React, { useState, useMemo } from 'react';
import { FileDown, ShieldCheck, X, AlertCircle, HardDriveDownload, Network, Laptop, ChevronDown } from 'lucide-react';
import { AccessLog, Device } from '../types';
import { exportLogsToCSV } from '../utils/exportUtils';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  allLogs: AccessLog[];
  devices: Device[];
  initialDeviceId?: string;
  aiSummary: any;
}

const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose, allLogs, devices, initialDeviceId = 'all', aiSummary }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [filterDeviceId, setFilterDeviceId] = useState<string>(initialDeviceId);

  const filteredLogs = useMemo(() => {
    if (filterDeviceId === 'all') return allLogs;
    return allLogs.filter(log => log.deviceId === filterDeviceId);
  }, [allLogs, filterDeviceId]);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    // Local processing simulation
    setTimeout(() => {
      exportLogsToCSV(filteredLogs);
      setIsExporting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Audit Compliance Engine</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">On-Premise Security Reporting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Device Selector for Audit */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Select Audit Target Device</label>
            <div className="relative group">
              <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select 
                value={filterDeviceId}
                onChange={(e) => setFilterDeviceId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200 appearance-none cursor-pointer group-hover:border-zinc-700"
              >
                <option value="all">Global Site Audit (All Devices)</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            </div>
          </div>

          {aiSummary ? (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Compliance Insights</h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-black">
                  {aiSummary.pciCompliance}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-3 italic">"{aiSummary.observations[0]}"</p>
              <div className="space-y-1">
                {aiSummary.recommendations.slice(0, 2).map((rec: string, i: number) => (
                  <div key={i} className="flex gap-2 text-[11px] text-zinc-500">
                    <span className="text-emerald-500">•</span> {rec}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
              <Network className="w-8 h-8 text-zinc-700 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">Local Validation Only</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[300px]">
                Proceeding with standard local audit. Detailed AI analysis is currently offline.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl flex items-center gap-3">
              <HardDriveDownload className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Available Records</p>
                <p className="text-lg font-bold text-zinc-100">{filteredLogs.length}</p>
              </div>
            </div>
            <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Selection Scope</p>
                <p className="text-xs font-bold text-zinc-300 truncate max-w-[120px]">
                  {filterDeviceId === 'all' ? 'Entire Network' : devices.find(d => d.id === filterDeviceId)?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting || filteredLogs.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Download ({filterDeviceId === 'all' ? 'Full' : 'Scoped'}) CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
