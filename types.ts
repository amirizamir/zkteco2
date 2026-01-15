
export enum AccessType {
  FINGERPRINT = 'FINGERPRINT',
  RFID_CARD = 'RFID_CARD',
  PASSCODE = 'PASSCODE',
  FACE = 'FACE'
}

export enum AccessStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
  ALERT = 'ALERT'
}

export interface User {
  id: string;
  name: string;
  department: string;
  primaryMethod: AccessType;
  enrollmentDate: Date;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface Device {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  model: string;
  status: 'online' | 'offline';
}

export interface AccessLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  department: string;
  deviceId: string;
  deviceInfo?: Device;
  method: AccessType;
  status: AccessStatus;
  details?: string;
  notificationSent?: boolean;
}

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  message: string;
  isResolved: boolean;
  deviceId?: string;
}

export interface NotificationSettings {
  email: string;
  notifyOnGranted: boolean;
  notifyOnDenied: boolean;
  enabled: boolean;
}

export interface DashboardStats {
  totalEntries: number;
  failedAttempts: number;
  activeUsers: number;
  lastSync: Date;
}
