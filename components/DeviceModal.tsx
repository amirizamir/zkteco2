
import React, { useState } from 'react';
import { X, Server, MapPin, Globe, Shield, Laptop, Network } from 'lucide-react';
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
      port: formData.port,
      model: formData.model,
      status: 'online'
    };
    onAdd(newDevice);
    onClose();
    setFormData({ name: '', location: '', ipAddress: '', port: '4370', model: 'ZKTeco F22' });
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
              <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tighter">Hardware Node</h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Connect F22 Terminal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1.5 ml-1">Terminal Nickname</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200"
                placeholder="e.g. Server Vault Entry"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1.5 ml-1">Physical Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200"
                  placeholder="e.g. Floor 2, Zone B"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-2">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1.5 ml-1">IP Address</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-zinc-200"
                  placeholder="10.0.40.107"
                  value={formData.ipAddress}
                  onChange={e => setFormData({...formData, ipAddress: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase mb-1.5 ml-1">Port</label>
              <div className="relative">
                <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono text-zinc-200 text-center"
                  value={formData.port}
                  onChange={e => setFormData({...formData, port: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
             <div className="flex items-start gap-3">
               <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Connectivity Policy</span>
                 <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
                   System will attempt a direct UDP handshake with the F22 terminal. Ensure port <span className="text-zinc-400 font-mono">4370</span> is open in your network firewall.
                 </p>
               </div>
             </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 uppercase tracking-widest text-xs"
            >
              Add Terminal to Cluster
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceModal;
