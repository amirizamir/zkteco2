
import { AccessType, AccessStatus, AccessLog, Device, User } from './types';

// Demo data removed for Production
export const INITIAL_USERS: User[] = [];

export const INITIAL_DEVICES: Device[] = [];

export const generateMockLog = (devices: Device[], users: User[]): AccessLog | null => {
  if (devices.length === 0 || users.length === 0) return null;
  
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
