import fs from 'fs';
import path from 'path';

/**
 * Server-side data fetching utilities for SSR
 * These functions read JSON files directly from the file system,
 * avoiding API calls during server-side rendering
 */

const getDataDir = () => path.join(process.cwd(), 'public', 'data');

export async function fetchImmigrationData() {
  try {
    const iceDataPath = path.join(getDataDir(), 'ice_detention_data.json');
    const cbpDataPath = path.join(getDataDir(), 'cbp_apprehensions_data.json');

    if (!fs.existsSync(iceDataPath) || !fs.existsSync(cbpDataPath)) {
      return null;
    }

    // Clean NaN values before parsing (same as API route)
    const iceDataRaw = fs.readFileSync(iceDataPath, 'utf8');
    const cleanedIceData = iceDataRaw.replace(/:\s*NaN/g, ': null');
    const iceData = JSON.parse(cleanedIceData);
    
    const cbpData = JSON.parse(fs.readFileSync(cbpDataPath, 'utf8'));

    return {
      ice: iceData,
      cbp: cbpData
    };
  } catch (error) {
    console.error('Error fetching immigration data:', error);
    return null;
  }
}

export async function fetchEconomicData() {
  try {
    const dataDir = getDataDir();
    
    const integratedData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'integrated_economic_dashboard.json'), 'utf8')
    );
    
    const tariffAnalysisData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'gemini_tariff_analysis.json'), 'utf8')
    );
    
    const tariffCountryData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'tariff_data_clean.json'), 'utf8')
    );
    
    const tariffData = {
      ...tariffAnalysisData,
      country_tariffs: tariffCountryData.country_tariffs || []
    };
    
    const stockData = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'presidential_sp500_comparison.json'), 'utf8')
    );

    const trumpData = stockData.presidential_data?.["Donald Trump (2nd Term)"];

    return {
      integrated: integratedData,
      tariff: tariffData,
      stock: stockData,
      trumpCurrent: trumpData || null
    };
  } catch (error) {
    console.error('Error fetching economic data:', error);
    return null;
  }
}

export async function fetchPromisesData() {
  try {
    const dataDir = getDataDir();
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, 'promises.json'), 'utf8')
    );
  } catch (error) {
    console.error('Error fetching promises data:', error);
    return null;
  }
}

export async function fetchFederalEmployeesData() {
  try {
    const dataDir = getDataDir();
    // Try to find the most recent file
    const files = fs.readdirSync(dataDir);
    const federalEmployeeFiles = files.filter(f => f.startsWith('federal_employees_data') && f.endsWith('.json'));
    
    // Sort by filename (newest first if timestamped) or use the base one
    federalEmployeeFiles.sort().reverse();
    const targetFile = federalEmployeeFiles[0] || 'federal_employees_data.json';
    
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, targetFile), 'utf8')
    );
  } catch (error) {
    console.error('Error fetching federal employees data:', error);
    return null;
  }
}

export async function fetchSp500Data() {
  try {
    const dataDir = getDataDir();
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, 'presidential_sp500_comparison.json'), 'utf8')
    );
  } catch (error) {
    console.error('Error fetching S&P 500 data:', error);
    return null;
  }
}

export async function fetchCongressData() {
  try {
    const dataDir = getDataDir();
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, 'congressional_analysis.json'), 'utf8')
    );
  } catch (error) {
    console.error('Error fetching congress data:', error);
    return null;
  }
}

export async function fetchTariffData() {
  try {
    const dataDir = getDataDir();
    return JSON.parse(
      fs.readFileSync(path.join(dataDir, 'tariff_data_clean.json'), 'utf8')
    );
  } catch (error) {
    console.error('Error fetching tariff data:', error);
    return null;
  }
}

export async function fetchForeignAffairsData() {
  try {
    const dataDir = getDataDir();
    // Try the detailed version first (used by foreign-affairs page), fallback to condensed
    const detailedPath = path.join(dataDir, 'enhanced_foreign_affairs_data_detailed.json');
    const condensedPath = path.join(dataDir, 'foreign_affairs_data_condensed.json');
    
    if (fs.existsSync(detailedPath)) {
      return JSON.parse(fs.readFileSync(detailedPath, 'utf8'));
    } else if (fs.existsSync(condensedPath)) {
      return JSON.parse(fs.readFileSync(condensedPath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error('Error fetching foreign affairs data:', error);
    return null;
  }
}

