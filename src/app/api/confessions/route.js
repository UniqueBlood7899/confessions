//app/api/confessions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../utils/mongoConnect';
import Confession from '../../models/Confession';

// Maximum number of confessions to keep
const MAX_CONFESSIONS = 260000; // Approx

export async function GET() {
  await dbConnect();

  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    return NextResponse.json(confessions);
  } catch (error) {
    console.error('Error fetching confessions:', error);
    return NextResponse.json({ message: 'Error fetching confessions' }, { status: 500 });
  }
}

/**
 * Removes the oldest confession when the count exceeds the maximum
 */
async function pruneOldestConfession() {
  try {
    // Count total confessions
    const count = await Confession.countDocuments();
    
    // If we're at or over the limit, delete the oldest one
    if (count > MAX_CONFESSIONS) {
      // Find the oldest confession
      const oldestConfession = await Confession.findOne().sort({ createdAt: 1 });
      
      if (oldestConfession) {
        // Delete the oldest confession
        await Confession.deleteOne({ _id: oldestConfession._id });
        console.log(`Deleted oldest confession (ID: ${oldestConfession._id}) to maintain limit of ${MAX_CONFESSIONS}`);
      }
    }
  } catch (error) {
    console.error('Error pruning oldest confession:', error);
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ message: 'Content is required and must be a string' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ message: 'Confession cannot be more than 2000 characters' }, { status: 400 });
    }

    // Create and save the confession with only content
    const confession = await Confession.create({ content });

    // After creating a new confession, check if we need to delete old ones
    await pruneOldestConfession();

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Error posting confession:', error);
    return NextResponse.json({ message: 'Error posting confession' }, { status: 500 });
  }
}