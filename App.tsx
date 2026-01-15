
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
  CheckCircle2
} from 'lucide-react';

import { AccessLog, AccessStatus, DashboardStats, SecurityAlert, Device, NotificationSettings, User } from './types';
import { generateMockLog, INITIAL_DEVICES, INITIAL_USERS } from './constants';
import StatCard from './components/StatCard';
import AccessLogTable from './components/AccessLogTable';
import AuditModal from './components/AuditModal';
import DeviceModal from './components/DeviceModal';
import NotificationModal from './components/NotificationModal';
import UserModal from './components/UserModal';
import { dbService } from './services/databaseService';

const App: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | 'all'>('all');
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    failedAttempts: 0,
    activeUsers: 0,
    lastSync: new Date()
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: 'admin@datacenter.net',
    notifyOnGranted: true,
    notifyOnDenied: true,
    enabled: true
  });

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);

  const activeDevice = useMemo(() => 
    selectedDeviceId === 'all' ? null : devices.find(d => d.id === selectedDeviceId)
  , [selectedDeviceId, devices]);

  // Derived: History of logs that triggered a notification
  const sentNotifications = useMemo(() => 
    logs.filter(l => l.notificationSent).slice(0, 10)
  , [logs]);

  // Initial Data Fetch from SQL
  useEffect(() => {
    const initData = async () => {
      try {
        const savedLogs = await dbService.getAllLogs();
        const savedUsers = await dbService.getAllUsers();
        
        if (savedLogs.length > 0) {
          setLogs(savedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
          
          const recentAlerts = savedLogs
            .filter(l => l.status === AccessStatus.DENIED)
            .slice(0, 10)
            .map(l => ({
              id: l.id,
              timestamp: l.timestamp,
              severity: 'high' as const,
              message: `Unauthorized attempt at ${l.deviceId} by ${l.userName}`,
              isResolved: false,
              deviceId: l.deviceId
            }));
          setAlerts(recentAlerts);
        }
        
        if (savedUsers.length > 0) setUsers(savedUsers);
        
        setIsDbReady(true);
        setStats({
          totalEntries: savedLogs.filter(l => l.status === AccessStatus.GRANTED).length,
          failedAttempts: savedLogs.filter(l => l.status === AccessStatus.DENIED).length,
          activeUsers: savedUsers.length || users.length,
          lastSync: new Date()
        });
      } catch (err) {
        console.error("SQL Connection Error:", err);
        setIsDbReady(true);
      }
    };
    initData();
  }, []);

  // Real-time Event Processor (Simulates F22 Hardware Events)
  useEffect(() => {
    if (!isDbReady) return;

    const interval = setInterval(async () => {
      const newLog = generateMockLog(devices, users);
      
      // Notification Logic: Check if we should "send email"
      let shouldNotify = false;
      if (notificationSettings.enabled) {
        if (newLog.status === AccessStatus.GRANTED && notificationSettings.notifyOnGranted) shouldNotify = true;
        if (newLog.status === AccessStatus.DENIED && notificationSettings.notifyOnDenied) shouldNotify = true;
      }
      
      if (shouldNotify) {
        newLog.notificationSent = true;
        newLog.details = `${newLog.details || ''} [Email Sent to ${notificationSettings.email}]`;
      }

      // Persist to SQL
      await dbService.saveLog(newLog);

      // Update Local State
      setLogs(prev => [newLog, ...prev.slice(0, 99)]);
      
      if (newLog.status === AccessStatus.DENIED) {
        setAlerts(prev => [{
          id: Math.random().toString(),
          timestamp: new Date(),
          severity: 'high',
          message: `BREACH ALERT: Access Denied for ${newLog.userName} at ${newLog.deviceInfo?.name || 'Main Gate'}`,
          isResolved: false,
          deviceId: newLog.deviceId
        }, ...prev.slice(0, 14)]);
      }

      setStats(prev => ({
        ...prev,
        totalEntries: prev.totalEntries + (newLog.status === AccessStatus.GRANTED ? 1 : 0),
        failedAttempts: prev.failedAttempts + (newLog.status === AccessStatus.DENIED ? 1 : 0),
        activeUsers: users.length,
        lastSync: new Date()
      }));
    }, 7000);

    return () => clearInterval(interval);
  }, [devices, users, isDbReady, notificationSettings]);

  const handleAddUser = async (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    await dbService.saveUser(newUser);
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
    
    return sortedDays.map((day) => ({
      name: day,
      entries: Math.floor(Math.random() * 80) + 40,
      denied: Math.floor(Math.random() * 12) + 2
    }));
  }, [selectedDeviceId]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <NotificationModal 
        isOpen={isNotifyModalOpen} 
        onClose={() => setIsNotifyModalOpen(false)} 
        settings={notificationSettings} 
        onSave={setNotificationSettings} 
      />
      <AuditModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} allLogs={logs} devices={devices} initialDeviceId={selectedDeviceId} aiSummary={null} />
      <DeviceModal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} onAdd={(d) => { setDevices(p => [...p, d]); dbService.saveDevice(d); }} />
      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} users={users} onAddUser={handleAddUser} onDeleteUser={(id) => setUsers(p => p.filter(u => u.id !== id))} onSyncAll={() => setIsSyncingUsers(true)} isSyncing={isSyncingUsers} />

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
              <option value="all">Network Cluster</option>
              {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 pointer-events-none" />
          </div>

          <button onClick={() => setIsNotifyModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-amber-500 rounded-lg transition-all relative group">
            <BellRing className="w-5 h-5" />
            {notificationSettings.enabled && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-zinc-900 animate-pulse"></span>}
          </button>

          <button onClick={() => setIsUserModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-lg transition-all" title="User Management">
            <Users className="w-5 h-5" />
          </button>
          
          <div className="w-px h-6 bg-zinc-800 mx-1"></div>
          
          <button onClick={() => setIsAuditModalOpen(true)} className="flex items-center gap-2 bg-zinc-100 hover:bg-white px-5 py-2.5 rounded-lg text-sm text-black font-bold transition-all shadow-lg shadow-white/5 active:scale-95">
            <ShieldCheck className="w-4 h-4" />
            Audit System
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
              {activeDevice ? activeDevice.name : "Real-time Access Intel"}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Terminal Sync</span>
              </div>
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Monitoring ZKTeco F22 biometric cluster with instant SMTP reporting.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3">
               <Wifi className="w-4 h-4 text-emerald-500" />
               <div className="flex flex-col">
                 <span className="text-[10px] text-zinc-500 font-bold uppercase">Uptime Status</span>
                 <span className="text-xs font-bold text-zinc-100">99.98% Operational</span>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Access Events" value={stats.totalEntries + stats.failedAttempts} icon={<Activity className="w-5 h-5" />} />
          <StatCard title="Denied Attempts" value={stats.failedAttempts} icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} trend="+2 today" trendType="down" />
          <StatCard title="Authorized Personnel" value={stats.activeUsers} icon={<Users className="w-5 h-5 text-blue-400" />} />
          <StatCard title="SMTP Dispatch Status" value={notificationSettings.enabled ? "Armed" : "Standby"} icon={<Send className="w-5 h-5 text-amber-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-emerald-500" /> 
                  Network Traffic Volume
                </h3>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                    <Bar dataKey="entries" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="denied" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="h-[600px]"><AccessLogTable logs={filteredLogs} /></div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* ALERTING SECTION */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
              <div className="p-5 bg-zinc-950/80 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <Bell className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm uppercase tracking-tight">Security Incident Queue</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Real-time Unauthorized Activity</p>
                  </div>
                </div>
                <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                  {filteredAlerts.length} ACTIVE
                </span>
              </div>
              
              <div className="p-5 space-y-4 overflow-y-auto max-h-[600px] scrollbar-hide">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-24 flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-500/5 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck className="w-8 h-8 text-emerald-500/20" />
                    </div>
                    <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Environment Secure</p>
                    <p className="text-[10px] text-zinc-500 mt-2 max-w-[180px]">No security violations detected on the F22 cluster.</p>
                  </div>
                ) : (
                  filteredAlerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Critical Alert</span>
                         <span className="text-[9px] text-zinc-600 font-mono">{alert.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed pr-2">{alert.message}</p>
                      <div className="mt-4 flex items-center gap-3 pt-3 border-t border-zinc-800/50">
                        <button className="text-[10px] font-black text-zinc-500 hover:text-zinc-100 uppercase transition-colors">Dismiss</button>
                        <button className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase transition-colors">Action Node</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* NOTIFICATION SECTION */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[500px]">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-amber-500" /> 
                    Notification Engine
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">SMTP Alerting Dashboard</p>
                 </div>
                 <button onClick={() => setIsNotifyModalOpen(true)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-100 transition-all">
                   <Settings className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Alert Status</span>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${notificationSettings.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                      {notificationSettings.enabled ? 'System Armed' : 'System Disarmed'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 truncate pb-3 border-b border-zinc-800/50 mb-3">
                    <Send className="w-3.5 h-3.5 text-zinc-600" />
                    {notificationSettings.email || 'No email configured'}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded-lg border text-center ${notificationSettings.notifyOnDenied ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                       <p className="text-[8px] font-black uppercase">Denied Trigger</p>
                       <p className="text-[10px] font-bold mt-1">{notificationSettings.notifyOnDenied ? 'ON' : 'OFF'}</p>
                    </div>
                    <div className={`p-2 rounded-lg border text-center ${notificationSettings.notifyOnGranted ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                       <p className="text-[8px] font-black uppercase">Granted Trigger</p>
                       <p className="text-[10px] font-bold mt-1">{notificationSettings.notifyOnGranted ? 'ON' : 'OFF'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* History of Sent Emails */}
              <div className="flex-1 flex flex-col min-h-0 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Dispatches</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-hide">
                  {sentNotifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Mail className="w-6 h-6 text-zinc-800 mx-auto mb-2" />
                      <p className="text-[9px] text-zinc-600 font-bold uppercase">No notifications sent</p>
                    </div>
                  ) : (
                    sentNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg flex items-center justify-between group hover:border-amber-500/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md ${notif.status === AccessStatus.DENIED ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                            {notif.status === AccessStatus.DENIED ? (
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-200">{notif.userName}</span>
                            <span className="text-[8px] text-zinc-600 uppercase font-black">{notif.status} ACCESS</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] text-zinc-500 font-mono">{notif.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                           <span className="text-[7px] text-amber-500 font-black uppercase tracking-tighter">Email Sent</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                <p className="text-[9px] text-amber-500 leading-snug">
                  <strong>Cluster Node Sync:</strong> Logs are processed locally and dispatched via the SMTP relay configured in settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">© 2024 Sentinel Networked Cluster</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-600/5 px-3 py-1 rounded-full border border-emerald-600/10">
              <Database className="w-3 h-3" />
              SQL PERSISTENCE ACTIVE
            </div>
            <div className="flex items-center gap-2 text-[10px] text-blue-600 bg-blue-600/5 px-3 py-1 rounded-full border border-blue-600/10">
              <Wifi className="w-3 h-3" />
              F22 TERMINAL SYNC: OK
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600">
           <span>SQL_CONN: PG_15@5432</span>
           <span className="w-px h-3 bg-zinc-800"></span>
           <span>SMTP_RELAY: ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
