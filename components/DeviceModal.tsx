
import React, { useState } from 'react';
import { X, Server, MapPin, Globe, Shield, Key } from 'lucide-react';
import { Device } from '../types';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: Device) => void;
}

const DeviceModal: React.FC<DeviceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    ipAddress: '',
    commKey: '0',
    port: '4370',
    model: 'ZKTeco F22'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDevice: Device = {
      id: `dev-${Math.random().toString(36).substr(2, 5)}`,
      name: formData.name,
      location: formData.location,
      ipAddress: formData.ipAddress,
      model: formData.model,
      status: 'online'
    };
    onAdd(newDevice);
    onClose();
    setFormData({ name: '', location: '', ipAddress: '', commKey: '0', port: '4370', model: 'ZKTeco F22' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Server className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Hardware Node Setup</h2>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Configure ZKTeco F22 Direct Link</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Device Nickname</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200"
                placeholder="e.g. Main Server Vault"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">IP Address</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200"
                  placeholder="192.168.1.201"
                  value={formData.ipAddress}
                  onChange={e => setFormData({...formData, ipAddress: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Comm Port</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm font-mono text-zinc-200"
                value={formData.port}
                onChange={e => setFormData({...formData, port: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-800 pb-2">Hardware Security</h4>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Comm Key (Password)</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="password"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200"
                  placeholder="Device Comm Key"
                  value={formData.commKey}
                  onChange={e => setFormData({...formData, commKey: e.target.value})}
                />
              </div>
              <p className="text-[9px] text-zinc-600 mt-1.5 ml-1 italic">Default ZKTeco comm key is usually "0".</p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              Add Device to LAN Scan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceModal;
