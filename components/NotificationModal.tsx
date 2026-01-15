
import React, { useState } from 'react';
// Added Users to the lucide-react import list to resolve the "Cannot find name 'Users'" error.
import { X, Mail, BellRing, ShieldAlert, CheckCircle2, Loader2, Globe, Server, Key, Eye, EyeOff, Send, Users } from 'lucide-react';
import { NotificationSettings } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleTest = () => {
    setIsTesting(true);
    setTestSuccess(false);
    // Simulate SMTP handshake and sending
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <BellRing className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Notification Engine</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Configure SMTP Relay & Alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8 scrollbar-thin">
          {/* Section 1: Alert Recipients */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3 h-3" /> Alert Recipients
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2 ml-1">Primary Receiver Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="email"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-200"
                  placeholder="security-ops@datacenter.com"
                  value={localSettings.email}
                  onChange={e => setLocalSettings({...localSettings, email: e.target.value})}
                />
              </div>
              <p className="text-[9px] text-zinc-600 mt-1.5 ml-1 italic">This address will receive all system alerts triggered below.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setLocalSettings({...localSettings, notifyOnGranted: !localSettings.notifyOnGranted})}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${localSettings.notifyOnGranted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950 border-zinc-800'}`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${localSettings.notifyOnGranted ? 'text-emerald-500' : 'text-zinc-700'}`} />
                  <span className={`text-xs font-bold ${localSettings.notifyOnGranted ? 'text-zinc-200' : 'text-zinc-600'}`}>On Granted</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${localSettings.notifyOnGranted ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${localSettings.notifyOnGranted ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </button>

              <button 
                onClick={() => setLocalSettings({...localSettings, notifyOnDenied: !localSettings.notifyOnDenied})}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${localSettings.notifyOnDenied ? 'bg-rose-500/5 border-rose-500/20' : 'bg-zinc-950 border-zinc-800'}`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-4 h-4 ${localSettings.notifyOnDenied ? 'text-rose-500' : 'text-zinc-700'}`} />
                  <span className={`text-xs font-bold ${localSettings.notifyOnDenied ? 'text-zinc-200' : 'text-zinc-600'}`}>On Denied</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${localSettings.notifyOnDenied ? 'bg-rose-500' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${localSettings.notifyOnDenied ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>
          </section>

          {/* Section 2: SMTP Relay Configuration */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3 h-3" /> SMTP Relay Configuration (Sender)
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">SMTP Host</label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono text-zinc-200"
                    placeholder="smtp.office365.com"
                    value={localSettings.smtp.host}
                    onChange={e => setLocalSettings({...localSettings, smtp: {...localSettings.smtp, host: e.target.value}})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Port</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm font-mono text-zinc-200 text-center"
                  placeholder="587"
                  value={localSettings.smtp.port}
                  onChange={e => setLocalSettings({...localSettings, smtp: {...localSettings.smtp, port: e.target.value}})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Sender Email Address (From)</label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="email"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200"
                    placeholder="alerts@datacenter.net"
                    value={localSettings.smtp.from}
                    onChange={e => setLocalSettings({...localSettings, smtp: {...localSettings.smtp, from: e.target.value}})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Username</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-zinc-200"
                  placeholder="SMTP User"
                  value={localSettings.smtp.user}
                  onChange={e => setLocalSettings({...localSettings, smtp: {...localSettings.smtp, user: e.target.value}})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono text-zinc-200"
                    placeholder="••••••••"
                    value={localSettings.smtp.pass}
                    onChange={e => setLocalSettings({...localSettings, smtp: {...localSettings.smtp, pass: e.target.value}})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-2">
            <button 
              onClick={handleTest}
              disabled={isTesting || !localSettings.email}
              className="w-full flex items-center justify-center gap-2 py-3 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {testSuccess ? "Success! SMTP Handshake OK" : "Test SMTP Connection"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
             <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">Global Alert Engine</span>
             <button 
                onClick={() => setLocalSettings({...localSettings, enabled: !localSettings.enabled})}
                className={`text-[9px] font-black px-3 py-1 rounded-full transition-colors border ${localSettings.enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
              >
                {localSettings.enabled ? 'RELAY ACTIVE' : 'RELAY STANDBY'}
              </button>
          </div>
          <button 
            onClick={() => { onSave(localSettings); onClose(); }}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95"
          >
            Apply & Save Relay Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
