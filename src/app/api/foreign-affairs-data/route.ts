import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    const foreignAffairsData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'foreign_affairs_data_condensed.json'), 'utf8')
    );

    return NextResponse.json(foreignAffairsData);
  } catch (error) {
    console.error('Error reading foreign affairs data:', error);
    return NextResponse.json({ error: 'Failed to load foreign affairs data' }, { status: 500 });
  }
}
