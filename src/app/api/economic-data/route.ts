import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Option 1: Call Python API server (if running)
    try {
      const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
      const response = await fetch(`${pythonApiUrl}/api/economic-data`);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Python API not available, falling back to direct file access
    }

    // Option 2: Fallback to direct file access (Next.js only)
    
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    
    const integratedData = JSON.parse(
      fs.readFileSync(path.join(publicDataDir, 'integrated_economic_dashboard.json'), 'utf8')
    );
    
    const tariffData = JSON.parse(
      fs.readFileSync(path.join(publicDataDir, 'tariff_data_clean.json'), 'utf8')
    );
    
    const stockData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'presidential_sp500_comparison.json'), 'utf8')
    );

    // Get Trump's current term data for quick access
    const trumpData = stockData.presidential_data?.["Donald Trump (2nd Term)"];
    
    return NextResponse.json({
      integrated: integratedData,
      tariff: tariffData,
      stock: stockData,
      trumpCurrent: trumpData || null
    });
  } catch (error) {
    console.error('Error reading economic data:', error);
    return NextResponse.json({ error: 'Failed to load economic data' }, { status: 500 });
  }
}
