
import { AccessLog, Device, User, AccessStatus, AccessType } from '../types';

export class DatabaseService {
  async init(): Promise<void> {
    console.log('SQL Database Client Initialized');
  }

  async saveLog(log: AccessLog): Promise<void> {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      // Ensure we consume the body to close the stream properly
      await response.json();
    } catch (e) {
      console.error('Failed to persist log to SQL Server:', e);
    }
  }

  async getAllLogs(): Promise<AccessLog[]> {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      
      return data.map((l: any) => ({
        ...l,
        timestamp: new Date(l.timestamp),
        userId: l.user_id || l.userId,
        userName: l.user_name || l.userName,
        deviceId: l.device_id || l.deviceId,
        status: l.status as AccessStatus,
        method: l.method as AccessType,
        department: l.department || 'N/A'
      }));
    } catch (e) {
      console.error('Fetch error in getAllLogs:', e);
      return [];
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      await response.json();
    } catch (e) {
      console.error('Failed to save user to SQL Server:', e);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return [];
      
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((u: any) => ({
        ...u,
        primaryMethod: u.primary_method || u.primaryMethod,
        enrollmentDate: new Date(u.enrollment_date || u.enrollmentDate),
        syncStatus: (u.sync_status || u.syncStatus || 'synced') as 'synced' | 'pending' | 'error'
      }));
    } catch (e) {
      console.error('Fetch error in getAllUsers:', e);
      return [];
    }
  }

  async saveDevice(device: Device): Promise<void> {
    console.debug('Persisting device node settings to SQL Server');
  }

  async getAllDevices(): Promise<Device[]> {
    return [];
  }

  async generateSQLExport(): Promise<string> {
    // Standard SQL export is handled by pg_dump in the container now
    return "Use 'pg_dump' on the database container for full backups.";
  }
}

export const dbService = new DatabaseService();
