import { NextResponse } from 'next/server';
import { SupporterDatabase } from '../../../../../lib/database';

export async function GET() {
  try {
    const supporters = SupporterDatabase.getAllSupporters();
    
    // Sort by creation date (newest first)
    supporters.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return NextResponse.json(supporters);
  } catch (error) {
    console.error('Error fetching supporters:', error);
    return NextResponse.json({ error: 'Failed to fetch supporters' }, { status: 500 });
  }
}
