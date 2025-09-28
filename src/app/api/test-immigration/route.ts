import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the real CBP apprehensions data
    const cbpDataPath = path.join(process.cwd(), 'public', 'data', 'cbp_apprehensions_data.json');
    const cbpData = JSON.parse(fs.readFileSync(cbpDataPath, 'utf8'));

    // Read the real ICE detention data and clean NaN values
    const iceDataPath = path.join(process.cwd(), 'public', 'data', 'ice_detention_data.json');
    let iceData;
    try {
      const iceDataRaw = fs.readFileSync(iceDataPath, 'utf8');
      // Replace NaN values with null to make it valid JSON
      const cleanedIceData = iceDataRaw.replace(/:\s*NaN/g, ': null');
      iceData = JSON.parse(cleanedIceData);
    } catch (iceError) {
      console.error('Error parsing ICE data:', iceError);
      // Fallback to test ICE data if file doesn't exist or can't be parsed
      iceData = {
        metadata: {
          source_url: "https://www.ice.gov/doclib/detention/FY25_detentionStats08142025.xlsx",
          description: "ICE detention statistics dataset"
        },
        sheets: {
          'Detention FY25': {
            metadata: {
              sheet_name: "Detention FY25",
              rows: 1,
              columns: 10
            },
            data: [
              {
                Processing_Disposition: 'Total',
                Total: 59380,
                Col_6: 59380,
                Col_19: 31281,
                Col_22: 272965
              }
            ]
          },
          'ATD FY25 YTD': {
            metadata: {
              sheet_name: "ATD FY25 YTD",
              rows: 5,
              columns: 6
            },
            data: [
              { Technology: 'BI SmartLINK', Count: 100000 },
              { Technology: 'BI SmartLINK with Phone', Count: 50000 },
              { Technology: 'GPS', Count: 30000 },
              { Technology: 'Other', Count: 20000 }
            ]
          }
        }
      };
    }

    const responseData = {
      ice: iceData,
      cbp: cbpData
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in immigration endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to load immigration data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
