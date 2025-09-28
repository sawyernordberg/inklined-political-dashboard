import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    
    const promisesData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'promises.json'), 'utf8')
    );

    return NextResponse.json(promisesData);
  } catch (error) {
    console.error('Error reading promises data:', error);
    return NextResponse.json({ error: 'Failed to load promises data' }, { status: 500 });
  }
}
