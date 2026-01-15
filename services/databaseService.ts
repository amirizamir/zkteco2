
import { AccessLog, Device, User, AccessStatus, AccessType, NotificationSettings } from '../types';

export class DatabaseService {
  async init(): Promise<void> {
    console.log('SQL Database Client Initialized');
  }

  async getSettings<T>(key: string): Promise<T | null> {
    try {
      const res = await fetch(`/api/settings/${key}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch settings:', e);
      return null;
    }
  }

  async saveSettings(key: string, value: any): Promise<void> {
    try {
      await fetch(`/api/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  async saveLog(log: AccessLog): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
    } catch (e) {
      console.error('Failed to persist log:', e);
    }
  }

  async getAllLogs(): Promise<AccessLog[]> {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data.map((l: any) => ({
        ...l,
        timestamp: new Date(l.timestamp),
        userId: l.user_id || l.userId,
        userName: l.user_name || l.userName,
        deviceId: l.device_id || l.deviceId,
        status: l.status as AccessStatus,
        method: l.method as AccessType,
        department: l.department || 'N/A'
      })) : [];
    } catch (e) {
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data.map((u: any) => ({
        ...u,
        primaryMethod: u.primary_method || u.primaryMethod,
        enrollmentDate: new Date(u.enrollment_date || u.enrollmentDate),
        syncStatus: (u.sync_status || u.syncStatus || 'synced') as any
      })) : [];
    } catch (e) {
      return [];
    }
  }

  async saveDevice(device: Device): Promise<void> {
    try {
      await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      });
    } catch (e) {
      console.error('Failed to save device:', e);
    }
  }

  async getAllDevices(): Promise<Device[]> {
    try {
      const res = await fetch('/api/devices');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data.map((d: any) => ({
        ...d,
        ipAddress: d.ip_address || d.ipAddress
      })) : [];
    } catch (e) {
      return [];
    }
  }
}

export const dbService = new DatabaseService();
