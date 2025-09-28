import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('=== Immigration API Route Started ===');
    
    // Read ICE data from public/data directory (scripts now save directly there)
    const publicIceDataPath = path.join(process.cwd(), 'public', 'data', 'ice_detention_data.json');
    const cbpDataPath = path.join(process.cwd(), 'public', 'data', 'cbp_apprehensions_data.json');
    
    console.log('Public ICE data path:', publicIceDataPath);
    console.log('CBP data path:', cbpDataPath);
    
    // Check if files exist
    const publicExists = fs.existsSync(publicIceDataPath);
    const cbpExists = fs.existsSync(cbpDataPath);
    
    console.log('File existence check:');
    console.log('- Public ICE data:', publicExists);
    console.log('- CBP data:', cbpExists);
    
    // Use ICE data from public location
    const iceDataPath = publicIceDataPath;
    if (!publicExists) {
      console.error('ICE data file not found in public/data directory');
      return NextResponse.json({ 
        error: 'ICE data file not found. Please run the ICE scraper first.',
        details: 'Run: python3 scripts/trump_admin/immigration_enforcement/ice_detention_data_processor.py'
      }, { status: 500 });
    }
    
    // Check if CBP data file exists
    if (!cbpExists) {
      console.error('CBP data file not found:', cbpDataPath);
      return NextResponse.json({ error: 'CBP data file not found' }, { status: 500 });
    }
    
    // Read ICE data
    console.log('Starting to read ICE data from:', iceDataPath);
    let iceData;
    try {
      const iceDataRaw = fs.readFileSync(iceDataPath, 'utf8');
      console.log('ICE data file read successfully, size:', iceDataRaw.length);
      
      // Clean NaN values before parsing JSON
      const cleanedIceData = iceDataRaw.replace(/:\s*NaN/g, ': null');
      console.log('ICE data cleaned of NaN values');
      
      iceData = JSON.parse(cleanedIceData);
      console.log('ICE data parsed successfully');
    } catch (iceError) {
      console.error('Error reading/parsing ICE data:', iceError);
      return NextResponse.json({ 
        error: 'Failed to read or parse ICE data',
        details: iceError instanceof Error ? iceError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Read CBP data
    console.log('Starting to read CBP data from:', cbpDataPath);
    let cbpData;
    try {
      const cbpDataRaw = fs.readFileSync(cbpDataPath, 'utf8');
      console.log('CBP data file read successfully, size:', cbpDataRaw.length);
      cbpData = JSON.parse(cbpDataRaw);
      console.log('CBP data parsed successfully');
    } catch (cbpError) {
      console.error('Error reading/parsing CBP data:', cbpError);
      return NextResponse.json({ 
        error: 'Failed to read or parse CBP data',
        details: cbpError instanceof Error ? cbpError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Process state-level detainment data from Facilities FY25 sheet
    console.log('Processing state detainment data...');
    let stateDetainmentData: Array<{state: string, detainees: number}> = [];
    let currentTotalDetainees = 0;
    
    try {
      // Get the current total detainee population from Detention FY25 sheet
      if (iceData.sheets?.['Detention FY25']?.data) {
        const detentionData = iceData.sheets['Detention FY25'].data;
        const totalRow = detentionData.find((row: Record<string, unknown>) => 
          row.Processing_Disposition === 'Total' && 
          row.Col_6 && 
          typeof row.Col_6 === 'number' && 
          row.Col_6 > 50000 && 
          row.Col_6 < 100000
        );
        
        if (totalRow && totalRow.Col_6) {
          currentTotalDetainees = parseFloat(totalRow.Col_6);
          console.log('Current total detainee population:', currentTotalDetainees);
        } else {
          console.log('Could not find current total detainee population, using facility totals');
        }
      }
      
      if (iceData.sheets?.['Facilities FY25']?.data) {
        const facilitiesData = iceData.sheets['Facilities FY25'].data;
        console.log('Found Facilities FY25 data with', facilitiesData.length, 'rows');
        
        // Aggregate detainees by state
        const stateTotals: { [key: string]: number } = {};
        
        facilitiesData.forEach((facility: Record<string, unknown>, index: number) => {
          try {
            if (facility.State && typeof facility.State === 'string' && facility.State.trim() && 
                facility.Level_A && facility.Level_B && facility.Level_C && facility.Level_D) {
              
              const state = facility.State.trim();
              const levelA = parseFloat(String(facility.Level_A)) || 0;
              const levelB = parseFloat(String(facility.Level_B)) || 0;
              const levelC = parseFloat(String(facility.Level_C)) || 0;
              const levelD = parseFloat(String(facility.Level_D)) || 0;
              
              const totalDetainees = levelA + levelB + levelC + levelD;
              
              if (totalDetainees > 0) {
                if (!stateTotals[state]) {
                  stateTotals[state] = 0;
                }
                stateTotals[state] += totalDetainees;
              }
            }
          } catch (facilityError) {
            console.warn(`Error processing facility at index ${index}:`, facilityError);
            // Continue processing other facilities
          }
        });
        
        // Convert to array and sort by detainee count
        // Don't slice - we need ALL states for accurate percentage calculations
        stateDetainmentData = Object.entries(stateTotals)
          .map(([state, detainees]) => ({ state, detainees }))
          .sort((a, b) => b.detainees - a.detainees);
        
        console.log('State detainment data processed successfully:', stateDetainmentData.length, 'states');
      } else {
        console.log('No Facilities FY25 data found in ICE data');
      }
    } catch (stateError) {
      console.error('Error processing state detainment data:', stateError);
      // Don't fail the entire request, just return empty state data
      stateDetainmentData = [];
    }

    // Return essential data including state detainment data
    console.log('Preparing response data...');
    const essentialIceData = {
      metadata: iceData.metadata || {},
      sheets: {
        'Detention FY25': {
          metadata: iceData.sheets?.['Detention FY25']?.metadata || {},
          data: iceData.sheets?.['Detention FY25']?.data?.slice(0, 100) || []
        },
        'ATD FY25 YTD': {
          metadata: iceData.sheets?.['ATD FY25 YTD']?.metadata || {},
          data: iceData.sheets?.['ATD FY25 YTD']?.data?.slice(0, 50) || []
        },
        'Facilities FY25': {
          metadata: iceData.sheets?.['Facilities FY25']?.metadata || {},
          data: iceData.sheets?.['Facilities FY25']?.data?.slice(0, 50) || []
        }
      },
      stateDetainment: stateDetainmentData,
      currentTotalDetainees: currentTotalDetainees
    };

    console.log('Immigration data processed successfully');
    console.log('State detainment data count:', stateDetainmentData.length);
    console.log('=== Immigration API Route Completed Successfully ===');
    
    return NextResponse.json({
      ice: essentialIceData,
      cbp: cbpData
    });
    
  } catch (error) {
    console.error('=== Immigration API Route Failed ===');
    console.error('Error reading immigration data:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json({ 
      error: 'Failed to load immigration data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
