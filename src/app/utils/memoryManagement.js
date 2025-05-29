import mongoose from 'mongoose';
import Confession from '../models/Confession';
import dbConnect from './mongoConnect';

// Constants for memory calculation
const TOTAL_MEMORY_MB = 512; // Total memory in MB
const MEMORY_THRESHOLD_PERCENT = 85; // Threshold percentage
const BYTES_PER_CHARACTER = 2; // UTF-16 uses 2 bytes per character
const BYTES_PER_MB = 1024 * 1024; // Bytes in a megabyte
const MAX_CHARS_PER_CONFESSION = 2000; // Maximum characters per confession
const METADATA_BYTES_PER_CONFESSION = 100; // Estimated metadata size in bytes (ObjectId, timestamps, etc.)

/**
 * Calculates total memory usage of all confessions in the database
 * @returns {Promise<{ totalBytes: number, percentUsed: number, confessionCount: number }>}
 */
async function calculateConfessionMemoryUsage() {
  await dbConnect();
  
  try {
    // Get all confessions to count their exact size
    const confessions = await Confession.find({}, 'content');
    
    let totalBytes = 0;
    
    // Calculate memory usage based on actual content length
    confessions.forEach(confession => {
      const contentLength = confession.content ? confession.content.length : 0;
      const confessionBytes = (contentLength * BYTES_PER_CHARACTER) + METADATA_BYTES_PER_CONFESSION;
      totalBytes += confessionBytes;
    });
    
    // Calculate the percentage of memory used
    const totalMemoryBytes = TOTAL_MEMORY_MB * BYTES_PER_MB;
    const percentUsed = (totalBytes / totalMemoryBytes) * 100;
    
    return {
      totalBytes,
      percentUsed,
      confessionCount: confessions.length
    };
  } catch (error) {
    console.error('Error calculating memory usage:', error);
    return {
      totalBytes: 0,
      percentUsed: 0,
      confessionCount: 0
    };
  }
}

/**
 * Monitors confession memory usage and removes oldest confessions when memory exceeds threshold
 * @returns {Promise<boolean>} - Whether cleanup was performed
 */
export async function manageMemoryUsage() {
  try {
    const { totalBytes, percentUsed, confessionCount } = await calculateConfessionMemoryUsage();
    
    console.log(`Memory usage: ${(totalBytes / BYTES_PER_MB).toFixed(2)}MB (${percentUsed.toFixed(2)}%) with ${confessionCount} confessions`);
    
    // If memory usage exceeds threshold, delete oldest confessions
    if (percentUsed > MEMORY_THRESHOLD_PERCENT) {
      await dbConnect();
      
      // Calculate how many confessions to delete
      // We'll delete enough to bring us down to 70% usage
      const targetPercentage = 70;
      const currentExcessBytes = totalBytes - ((targetPercentage / 100) * TOTAL_MEMORY_MB * BYTES_PER_MB);
      
      // Estimate how many confessions we need to delete
      // Using the average size of a confession
      const avgBytesPerConfession = totalBytes / confessionCount;
      const confessionsToDelete = Math.ceil(currentExcessBytes / avgBytesPerConfession);
      
      // Make sure we delete at least 5 confessions
      const deleteCount = Math.max(5, confessionsToDelete);
      
      console.log(`Need to delete approximately ${deleteCount} confessions to reach target memory usage`);
      
      // Find the oldest confessions based on our calculated count
      const oldestConfessions = await Confession.find({})
        .sort({ createdAt: 1 }) // Sort by oldest first
        .limit(deleteCount);
      
      if (oldestConfessions.length === 0) {
        console.log('No confessions to delete');
        return false;
      }
      
      // Get the IDs of the oldest confessions
      const confessionIdsToDelete = oldestConfessions.map(confession => confession._id);
      
      // Delete the confessions
      const deleteResult = await Confession.deleteMany({ 
        _id: { $in: confessionIdsToDelete } 
      });
      
      console.log(`Deleted ${deleteResult.deletedCount} old confessions to free up memory`);
      
      // Recalculate memory usage after deletion
      const newUsage = await calculateConfessionMemoryUsage();
      console.log(`New memory usage: ${(newUsage.totalBytes / BYTES_PER_MB).toFixed(2)}MB (${newUsage.percentUsed.toFixed(2)}%)`);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error managing memory:', error);
    return false;
  }
}

/**
 * Periodically checks memory usage and performs cleanup if needed
 * @param {number} interval - Check interval in milliseconds
 */
export function startMemoryMonitoring(interval = 60000) { // Default: check every minute
  setInterval(async () => {
    await manageMemoryUsage();
  }, interval);
  
  console.log(`Memory monitoring started with interval of ${interval}ms`);
}