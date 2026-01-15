
import React, { useState } from 'react';
import { X, UserPlus, Fingerprint, CreditCard, Key, ScanFace, Users, Trash2, RefreshCcw } from 'lucide-react';
import { User, AccessType } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, users, onAddUser, onDeleteUser, onSyncAll, isSyncing }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    id: '',
    primaryMethod: AccessType.FINGERPRINT
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      ...formData,
      enrollmentDate: new Date(),
      syncStatus: 'pending'
    };
    onAddUser(newUser);
    setFormData({ name: '', department: '', id: '', primaryMethod: AccessType.FINGERPRINT });
  };

  const getMethodIcon = (method: AccessType) => {
    switch (method) {
      case AccessType.FINGERPRINT: return <Fingerprint className="w-4 h-4" />;
      case AccessType.RFID_CARD: return <CreditCard className="w-4 h-4" />;
      case AccessType.PASSCODE: return <Key className="w-4 h-4" />;
      case AccessType.FACE: return <ScanFace className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex h-[600px]">
        
        {/* Left Panel: User List */}
        <div className="w-3/5 border-r border-zinc-800 flex flex-col bg-zinc-950/30">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100">User Directory</h2>
            </div>
            <button 
              onClick={onSyncAll}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSyncing ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing to Devices...' : 'Sync All Nodes'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {users.map((user) => (
              <div key={user.id} className="group p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 font-bold border border-zinc-700">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">{user.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${
                        user.syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {user.syncStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500">{user.department} • ID: {user.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-zinc-500" title={user.primaryMethod}>
                    {getMethodIcon(user.primaryMethod)}
                  </div>
                  <button 
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Add User Form */}
        <div className="w-2/5 flex flex-col p-6 bg-zinc-900">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Enroll New User</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Full Name</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-zinc-200"
                placeholder="Alex Sentinel"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Staff ID</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-zinc-200"
                placeholder="ST-001"
                value={formData.id}
                onChange={e => setFormData({...formData, id: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Department</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-zinc-200"
                placeholder="Engineering"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Primary Biometric</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(AccessType).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, primaryMethod: type})}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                      formData.primaryMethod === type ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {getMethodIcon(type)}
                    {type.split('_')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add to Directory
              </button>
              <p className="text-[9px] text-zinc-500 text-center mt-3 leading-relaxed">
                New users are added locally and must be synced with ZKTeco F22 terminals to enable hardware access.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
