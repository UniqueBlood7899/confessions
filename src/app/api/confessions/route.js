//app/api/confessions/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../utils/mongoConnect';
import Confession from '../../models/Confession';
import { manageMemoryUsage } from '../../utils/memoryManagement';

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

export async function POST(request) {
  await dbConnect();
  
  try {
    // Check memory before creating new confession
    await manageMemoryUsage();
    
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ message: 'Content is required and must be a string' }, { status: 400 });
    }

    // Create and save the confession with only content
    const confession = await Confession.create({ content });

    return NextResponse.json(confession);
  } catch (error) {
    console.error('Error posting confession:', error);
    return NextResponse.json({ message: 'Error posting confession' }, { status: 500 });
  }
}