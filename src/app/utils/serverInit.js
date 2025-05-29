import { startMemoryMonitoring } from './memoryManagement';

export function initializeServer() {
  // Start memory monitoring - check every 5 minutes
  startMemoryMonitoring(300000);
  
  console.log('Server initialization complete');
}