
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { 
  Bell, 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle,
  Zap,
  ShieldCheck,
  Plus,
  MapPin,
  ChevronDown,
  LayoutGrid,
  Mail,
  MailWarning,
  UserCheck,
  HardDrive,
  Database,
  Wifi,
  Settings,
  BellRing,
  Send,
  History,
  CheckCircle2,
  Cpu,
  Globe,
  RefreshCcw,
  Loader2
} from 'lucide-react';

import { AccessLog, AccessStatus, DashboardStats, SecurityAlert, Device, NotificationSettings, User } from './types';
import { generateMockLog } from './constants';
import StatCard from './components/StatCard';
import AccessLogTable from './components/AccessLogTable';
import AuditModal from './components/AuditModal';
import DeviceModal from './components/DeviceModal';
import NotificationModal from './components/NotificationModal';
import UserModal from './components/UserModal';
import { dbService } from './services/databaseService';

const App: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | 'all'>('all');
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    failedAttempts: 0,
    activeUsers: 0,
    lastSync: new Date()
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: 'admin@datacenter.net',
    notifyOnGranted: false,
    notifyOnDenied: true,
    enabled: true,
    smtp: {
      host: 'smtp.relay.net',
      port: '587',
      user: 'sentinel-alerts',
      pass: '********',
      from: 'sentinel-system@datacenter.net'
    }
  });

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  const activeDevice = useMemo(() => 
    selectedDeviceId === 'all' ? null : devices.find(d => d.id === selectedDeviceId)
  , [selectedDeviceId, devices]);

  const sentNotifications = useMemo(() => 
    logs.filter(l => l.notificationSent).slice(0, 10)
  , [logs]);

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      try {
        const [savedDevices, savedLogs, savedUsers, savedSettings] = await Promise.all([
          dbService.getAllDevices(),
          dbService.getAllLogs(),
          dbService.getAllUsers(),
          dbService.getSettings<NotificationSettings>('notifications')
        ]);
        
        setDevices(savedDevices);
        setUsers(savedUsers);
        if (savedSettings) setNotificationSettings(savedSettings);
        
        if (savedLogs.length > 0) {
          setLogs(savedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
          setAlerts(savedLogs.filter(l => l.status === AccessStatus.DENIED).map(l => ({
            id: l.id,
            timestamp: l.timestamp,
            severity: 'high' as const,
            message: `Unauthorized attempt at ${l.deviceId} by ${l.userName}`,
            isResolved: false,
            deviceId: l.deviceId
          })));
        }
        
        setIsDbReady(true);
        setStats({
          totalEntries: savedLogs.filter(l => l.status === AccessStatus.GRANTED).length,
          failedAttempts: savedLogs.filter(l => l.status === AccessStatus.DENIED).length,
          activeUsers: savedUsers.length,
          lastSync: new Date()
        });
      } catch (err) {
        setIsDbReady(true);
      }
    };
    initData();
  }, []);

  const handleManualSync = async () => {
    if (devices.length === 0 || users.length === 0) return;
    setIsSyncing(true);
    
    // Simulate multi-node pull
    setTimeout(async () => {
      const syncBatch: AccessLog[] = [];
      for(let i=0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const newLog = generateMockLog(devices, users);
        if (newLog) {
          if (notificationSettings.enabled && 
             ((newLog.status === AccessStatus.GRANTED && notificationSettings.notifyOnGranted) ||
              (newLog.status === AccessStatus.DENIED && notificationSettings.notifyOnDenied))) {
            newLog.notificationSent = true;
          }
          await dbService.saveLog(newLog);
          syncBatch.push(newLog);
        }
      }
      
      setLogs(prev => [...syncBatch, ...prev].slice(0, 100));
      setStats(prev => ({
        ...prev,
        totalEntries: prev.totalEntries + syncBatch.filter(l => l.status === AccessStatus.GRANTED).length,
        failedAttempts: prev.failedAttempts + syncBatch.filter(l => l.status === AccessStatus.DENIED).length,
        lastSync: new Date()
      }));
      setIsSyncing(false);
    }, 2000);
  };

  const handleSaveNotificationSettings = async (settings: NotificationSettings) => {
    await dbService.saveSettings('notifications', settings);
    setNotificationSettings(settings);
  };

  const filteredLogs = useMemo(() => 
    selectedDeviceId === 'all' ? logs : logs.filter(l => l.deviceId === selectedDeviceId)
  , [logs, selectedDeviceId]);

  const filteredAlerts = useMemo(() => 
    selectedDeviceId === 'all' ? alerts : alerts.filter(a => a.deviceId === selectedDeviceId)
  , [alerts, selectedDeviceId]);

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIndex = (new Date().getDay() + 6) % 7;
    const sortedDays = [...days.slice(todayIndex + 1), ...days.slice(0, todayIndex + 1)];
    return sortedDays.map(day => ({ name: day, entries: Math.floor(Math.random() * 80), denied: Math.floor(Math.random() * 10) }));
  }, [selectedDeviceId]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <NotificationModal isOpen={isNotifyModalOpen} onClose={() => setIsNotifyModalOpen(false)} settings={notificationSettings} onSave={handleSaveNotificationSettings} />
      <AuditModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} allLogs={logs} devices={devices} initialDeviceId={selectedDeviceId} aiSummary={null} />
      <DeviceModal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} onAdd={(d) => { dbService.saveDevice(d); setDevices(p => [...p, d]); }} />
      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} users={users} onAddUser={(u) => { dbService.saveUser(u); setUsers(p => [...p, u]); }} onDeleteUser={(id) => setUsers(p => p.filter(u => u.id !== id))} onSyncAll={() => {}} isSyncing={false} />

      <header className="h-16 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight uppercase">Sentinel Access</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Data Center Infrastructure</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm">
            <MapPin className="w-4 h-4 text-zinc-500 mr-2" />
            <select 
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-transparent appearance-none pr-6 focus:outline-none text-zinc-200 font-medium cursor-pointer"
            >
              <option value="all">Global Site ({devices.length} Nodes)</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name} [{d.ipAddress}]</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 pointer-events-none" />
          </div>

          <button onClick={handleManualSync} disabled={isSyncing || devices.length === 0} className={`p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg transition-all ${isSyncing ? 'text-blue-500 bg-blue-500/10 animate-pulse' : 'text-zinc-400 hover:bg-zinc-800'}`} title="Pull Logs from Devices">
            <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          <button onClick={() => setIsDeviceModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-blue-400 rounded-lg transition-all" title="Add F22 Node">
            <Plus className="w-5 h-5" />
          </button>

          <button onClick={() => setIsNotifyModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-amber-500 rounded-lg transition-all relative group">
            <BellRing className="w-5 h-5" />
            {notificationSettings.enabled && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-zinc-900"></span>}
          </button>

          <button onClick={() => setIsUserModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-lg transition-all" title="User Management">
            <Users className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-zinc-800 mx-1"></div>
          
          <button onClick={() => setIsAuditModalOpen(true)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white px-5 py-2.5 rounded-lg text-sm text-black font-bold transition-all shadow-lg shadow-white/5 active:scale-95">
            <ShieldCheck className="w-4 h-4" />
            Audit
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl">
             <Cpu className="w-16 h-16 text-zinc-700 mb-6" />
             <h2 className="text-xl font-bold text-zinc-200 uppercase tracking-widest">No Hardware Configured</h2>
             <p className="text-zinc-500 mt-2 max-w-sm text-center px-6 italic">Add your ZKTeco F22 terminals via the (+) button in the header to start monitoring access events.</p>
             <button onClick={() => setIsDeviceModalOpen(true)} className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-900/20">
               <Plus className="w-5 h-5" />
               Setup F22 Terminal
             </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3 uppercase tracking-tighter">
                  {activeDevice ? activeDevice.name : "Unified Cluster Monitoring"}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
                  </div>
                </h2>
                <p className="text-sm text-zinc-500 mt-1">Status: {activeDevice ? `${activeDevice.ipAddress}:${activeDevice.port} | ${activeDevice.location}` : "All hardware nodes online"}.</p>
              </div>
              <button onClick={handleManualSync} disabled={isSyncing} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-6 py-2.5 rounded-xl text-zinc-200 hover:bg-zinc-800 transition-all active:scale-95">
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <RefreshCcw className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase tracking-widest">Sync Logs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="SQL Records" value={logs.length} icon={<Activity className="w-5 h-5" />} />
              <StatCard title="Failed Access" value={stats.failedAttempts} icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} />
              <StatCard title="Active Staff" value={stats.activeUsers} icon={<Users className="w-5 h-5 text-blue-400" />} />
              <StatCard title="SMTP Relay" value={notificationSettings.enabled ? "Armed" : "Disabled"} icon={<Send className="w-5 h-5 text-amber-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-[400px]">
                  <h3 className="font-semibold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wider mb-6">
                    <Activity className="w-4 h-4 text-emerald-500" /> 
                    Activity Volume
                  </h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                        <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                        <Bar dataKey="entries" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="h-[600px]"><AccessLogTable logs={filteredLogs} /></div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                {/* Notification Engine Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[500px]">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                       <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Mail className="w-4 h-4 text-amber-500" /> 
                        Notification Hub
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">SMTP Configuration</p>
                     </div>
                     <button onClick={() => setIsNotifyModalOpen(true)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-all">
                       <Settings className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 mb-6 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="text-[10px] font-black text-zinc-600 uppercase">Sender (Relay)</span>
                      <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">{notificationSettings.smtp.from}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="text-[10px] font-black text-zinc-600 uppercase">Receiver (Target)</span>
                      <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[150px]">{notificationSettings.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase">Status</span>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${notificationSettings.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {notificationSettings.enabled ? 'RELAY ACTIVE' : 'DISABLED'}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Dispatch Log</span>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-hide">
                      {sentNotifications.length === 0 ? (
                        <div className="py-20 text-center">
                          <Mail className="w-6 h-6 text-zinc-800 mx-auto mb-2" />
                          <p className="text-[9px] text-zinc-600 font-bold uppercase">No alerts sent yet</p>
                        </div>
                      ) : (
                        sentNotifications.map(notif => (
                          <div key={notif.id} className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg flex items-center justify-between group hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${notif.status === AccessStatus.DENIED ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                                {notif.status === AccessStatus.DENIED ? <AlertTriangle className="w-3 h-3 text-rose-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-zinc-200">{notif.userName}</span>
                                <span className="text-[8px] text-zinc-600 uppercase font-black">{notif.status}</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-amber-500 font-black uppercase tracking-tighter">Email Sent</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Incident Queue */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-h-[400px] shadow-2xl">
                  <div className="p-5 bg-zinc-950/80 border-b border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/10 rounded-lg">
                        <Bell className="w-5 h-5 text-rose-500" />
                      </div>
                      <h3 className="font-bold text-zinc-100 text-sm uppercase tracking-tight">Incidents</h3>
                    </div>
                    <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">{filteredAlerts.length}</span>
                  </div>
                  <div className="p-5 overflow-y-auto scrollbar-hide space-y-3">
                    {filteredAlerts.length === 0 ? (
                      <div className="text-center py-12">
                        <ShieldCheck className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">System Secure</p>
                      </div>
                    ) : (
                      filteredAlerts.map(alert => (
                        <div key={alert.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                          <p className="text-[11px] text-zinc-200">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">© Sentinel Access v2.0</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-600/5 px-3 py-1 rounded-full border border-emerald-600/10">
              <Database className="w-3 h-3" />
              SQL PERSISTED
            </div>
            <div className="flex items-center gap-2 text-[10px] text-blue-600 bg-blue-600/5 px-3 py-1 rounded-full border border-blue-600/10">
              <Wifi className="w-3 h-3" />
              F22 CLUSTER: {devices.length} NODES
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600">
           <span>SMTP: {notificationSettings.smtp.host}:{notificationSettings.smtp.port}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
