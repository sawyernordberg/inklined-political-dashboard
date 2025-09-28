import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    const congressData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'congressional_analysis.json'), 'utf8')
    );

    return NextResponse.json(congressData);
  } catch (error) {
    console.error('Error reading congress data:', error);
    return NextResponse.json({ error: 'Failed to load congress data' }, { status: 500 });
  }
}
