
import React, { useState } from 'react';
import { X, Mail, BellRing, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
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
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <BellRing className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Email Alert Settings</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Configure Instant Notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 ml-1">Recipient Email Address</label>
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
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 ml-1">Event Triggers</label>
            
            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-zinc-300">Access Granted</span>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, notifyOnGranted: !localSettings.notifyOnGranted})}
                className={`w-10 h-5 rounded-full transition-colors relative ${localSettings.notifyOnGranted ? 'bg-amber-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${localSettings.notifyOnGranted ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span className="text-sm text-zinc-300">Access Denied (Alert)</span>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, notifyOnDenied: !localSettings.notifyOnDenied})}
                className={`w-10 h-5 rounded-full transition-colors relative ${localSettings.notifyOnDenied ? 'bg-amber-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${localSettings.notifyOnDenied ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleTest}
              disabled={isTesting || !localSettings.email}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {testSuccess ? "Success! Test Email Sent" : "Send Test Alert Email"}
            </button>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
             <span className="text-xs text-zinc-500 font-medium italic">Global Notification Engine</span>
             <button 
                onClick={() => setLocalSettings({...localSettings, enabled: !localSettings.enabled})}
                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${localSettings.enabled ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-500'}`}
              >
                {localSettings.enabled ? 'ARMED' : 'DISARMED'}
              </button>
          </div>
          <button 
            onClick={() => { onSave(localSettings); onClose(); }}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95"
          >
            Save Alert Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
