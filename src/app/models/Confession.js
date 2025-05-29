//app/models/Confession.js
import mongoose from 'mongoose';

const ConfessionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide the confession content'],
    maxlength: [2000, 'Confession cannot be more than 2000 characters'], // Updated to 2000
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

export default mongoose.models.Confession || mongoose.model('Confession', ConfessionSchema);