import mongoose from 'mongoose';
import dbConnect from './mongoConnect.js';
import Confession from '../models/Confession.js';

/**
 * Deletes all confessions from the database
 * @returns {Promise<{ success: boolean, deletedCount: number, error?: string }>}
 */
export async function deleteAllConfessions() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Count confessions before deletion for reporting
    const countBefore = await Confession.countDocuments();
    
    // Delete all confessions
    const result = await Confession.deleteMany({});
    
    console.log(`Successfully deleted all ${result.deletedCount} confessions from the database`);
    
    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error('Error deleting all confessions:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error.message
    };
  } finally {
    // Only close the connection if we opened it specifically for this operation
    if (mongoose.connection.readyState === 1 && !global.mongoose?.conn) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// If this file is run directly, execute the deletion
if (typeof require !== 'undefined' && require.main === module) {
  deleteAllConfessions()
    .then(result => {
      if (result.success) {
        console.log(`Cleanup complete. Deleted ${result.deletedCount} confessions.`);
        process.exit(0);
      } else {
        console.error(`Cleanup failed: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

// For direct Node.js execution
if (typeof process !== 'undefined' && process.argv[1] === fileURLToPath(import.meta.url)) {
  const { deleteAllConfessions } = await import('./deleteAllConfessions.js');
  const result = await deleteAllConfessions();
  
  if (result.success) {
    console.log(`🧹 Cleanup complete. Deleted ${result.deletedCount} confessions.`);
    process.exit(0);
  } else {
    console.error(`❌ Cleanup failed: ${result.error}`);
    process.exit(1);
  }
}