
import { AccessType, AccessStatus, AccessLog, Device, User } from './types';

export const INITIAL_USERS: User[] = [
  { id: '101', name: 'Alex Johnson', department: 'IT Infrastructure', primaryMethod: AccessType.FINGERPRINT, enrollmentDate: new Date('2023-01-15'), syncStatus: 'synced' },
  { id: '102', name: 'Sarah Miller', department: 'Security Ops', primaryMethod: AccessType.FACE, enrollmentDate: new Date('2023-02-10'), syncStatus: 'synced' },
  { id: '103', name: 'James Wilson', department: 'Data Science', primaryMethod: AccessType.RFID_CARD, enrollmentDate: new Date('2023-03-05'), syncStatus: 'synced' },
  { id: '104', name: 'Elena Rodriguez', department: 'Network Engineering', primaryMethod: AccessType.PASSCODE, enrollmentDate: new Date('2023-04-20'), syncStatus: 'synced' }
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-001',
    name: 'Main Server Vault',
    location: 'North Wing, DC-1',
    ipAddress: '192.168.1.144',
    model: 'ZKTeco F22',
    status: 'online'
  },
  {
    id: 'dev-002',
    name: 'Backup Archive Room',
    location: 'South Annex, DC-2',
    ipAddress: '10.0.4.52',
    model: 'ZKTeco F22',
    status: 'online'
  }
];

export const generateMockLog = (devices: Device[], users: User[] = INITIAL_USERS): AccessLog => {
  const isUnauthorized = Math.random() < 0.1;
  const device = devices[Math.floor(Math.random() * devices.length)];
  const method = Object.values(AccessType)[Math.floor(Math.random() * 4)];
  
  if (isUnauthorized) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      userId: 'N/A',
      userName: 'Restricted User',
      department: 'Unknown',
      deviceId: device.id,
      deviceInfo: device,
      method,
      status: AccessStatus.DENIED,
      details: 'Invalid credentials or unauthorized biometric profile'
    };
  }

  const user = users[Math.floor(Math.random() * users.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    userId: user.id,
    userName: user.name,
    department: user.department,
    deviceId: device.id,
    deviceInfo: device,
    method: user.primaryMethod,
    status: AccessStatus.GRANTED,
    details: 'Access successful'
  };
};
