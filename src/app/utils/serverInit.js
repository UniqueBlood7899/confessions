import { manageMemoryUsage, startMemoryMonitoring } from './memoryManagement';

export function initializeServer() {
  try {
    console.log('Initializing server...');
    
    // Run an initial memory check
    manageMemoryUsage().then(cleaned => {
      if (cleaned) {
        console.log('Initial memory cleanup performed');
      } else {
        console.log('No initial memory cleanup needed');
      }
    });
    
    // Start memory monitoring - check every 5 minutes
    startMemoryMonitoring(300000);
    
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Failed to initialize server:', error);
  }
}