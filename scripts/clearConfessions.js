// This is a CommonJS module for better compatibility with direct node execution
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection setup
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined');
  process.exit(1);
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

// Define the Confession schema
const ConfessionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide the confession content'],
    maxlength: [2000, 'Confession cannot be more than 2000 characters'],
  },
  likes: {
    type: Number,
    default: 0,
  },
  username: {
    type: String,
    default: 'anonymous',
  },
}, { timestamps: true });

// Get the Confession model
const Confession = mongoose.models.Confession || mongoose.model('Confession', ConfessionSchema);

// Function to delete all confessions
async function deleteAllConfessions() {
  try {
    // Connect to the database
    const connected = await connectToMongoDB();
    if (!connected) {
      return { success: false, deletedCount: 0, error: 'Failed to connect to MongoDB' };
    }
    
    // Count confessions before deletion
    const countBefore = await Confession.countDocuments();
    console.log(`Found ${countBefore} confessions to delete`);
    
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
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Execute the delete operation
async function main() {
  console.log('🧹 Starting confession cleanup...');
  
  try {
    const result = await deleteAllConfessions();
    
    if (result.success) {
      console.log(`✅ Cleanup complete. Deleted ${result.deletedCount} confessions.`);
      process.exit(0);
    } else {
      console.error(`❌ Cleanup failed: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    process.exit(1);
  }
}

// Run the main function
main();