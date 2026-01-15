
import { AccessLog } from '../types';

export const exportLogsToCSV = (logs: AccessLog[]) => {
  const headers = ['Log ID', 'Timestamp', 'User ID', 'User Name', 'Department', 'Device', 'Method', 'Status', 'Audit Notes'];
  
  const csvContent = logs.map(log => [
    log.id,
    log.timestamp.toISOString(),
    log.userId,
    log.userName,
    log.department,
    // Fix: AccessLog interface uses deviceId or deviceInfo instead of device
    log.deviceInfo?.name || log.deviceId,
    log.method,
    log.status,
    log.details || ''
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));

  const blob = new Blob([[headers.join(','), ...csvContent].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `PCI_DSS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};