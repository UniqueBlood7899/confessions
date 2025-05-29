import mongoose from 'mongoose';
import Confession from '../models/Confession';
import dbConnect from './mongoConnect';

/**
 * Monitors memory usage and removes oldest confessions when memory exceeds threshold
 * @param {number} threshold - Memory threshold percentage (0-100)
 * @returns {Promise<boolean>} - Whether cleanup was performed
 */
export async function manageMemoryUsage(threshold = 85) {
  // Get current memory usage
  const memoryUsage = process.memoryUsage();
  const usedMemoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  console.log(`Current memory usage: ${usedMemoryPercentage.toFixed(2)}%`);
  
  // If memory usage exceeds threshold, delete oldest confessions
  if (usedMemoryPercentage > threshold) {
    try {
      await dbConnect();
      
      // Find the 5 oldest confessions
      const oldestConfessions = await Confession.find({})
        .sort({ createdAt: 1 }) // Sort by oldest first
        .limit(5);
      
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
      return true;
    } catch (error) {
      console.error('Error managing memory:', error);
      return false;
    }
  }
  
  return false;
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