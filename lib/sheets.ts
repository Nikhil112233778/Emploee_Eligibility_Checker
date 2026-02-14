import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Use globalThis to persist cache across Next.js hot reloads in dev mode
declare global {
  var employeeCache: {
    dataMap: Map<string, { mobile: string | null }> | null;
    dataRaw: any[][] | null;
    timestamp: number;
    isPreloading: boolean;
  } | undefined;
}

// Initialize global cache if it doesn't exist
if (!globalThis.employeeCache) {
  globalThis.employeeCache = {
    dataMap: null,
    dataRaw: null,
    timestamp: 0,
    isPreloading: false,
  };
}

const cache = globalThis.employeeCache;
const CACHE_TTL = 600000; // 10 minutes (longer cache)

// Helper function to build fast lookup map
function buildEmployeeMap(rows: any[][]): Map<string, { mobile: string | null }> {
  const map = new Map<string, { mobile: string | null }>();

  for (const row of rows) {
    if (row[0]) {
      const employeeId = row[0].toString().trim();
      const mobile = row[1]?.toString().trim() || null;
      map.set(employeeId, { mobile });
    }
  }

  return map;
}

// Pre-load data on first access
async function preloadData(): Promise<void> {
  if (cache.isPreloading) return;

  cache.isPreloading = true;
  try {
    console.log('Pre-loading employee data...');
    const startTime = Date.now();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:C',
    });

    cache.dataRaw = response.data.values || [];
    cache.dataMap = buildEmployeeMap(cache.dataRaw);
    cache.timestamp = Date.now();
    const loadTime = Date.now() - startTime;
    console.log(`Loaded ${cache.dataMap.size} employees into cache in ${loadTime}ms`);
  } catch (error) {
    console.error('Error pre-loading data:', error);
  } finally {
    cache.isPreloading = false;
  }
}

// Helper function to get cached or fresh data
async function getSheetData(forceRefresh = false): Promise<any[][]> {
  const now = Date.now();

  // Return cached data if it's still valid and not forcing refresh
  if (!forceRefresh && cache.dataRaw && (now - cache.timestamp) < CACHE_TTL) {
    return cache.dataRaw;
  }

  // If no cache, preload it
  if (!cache.dataRaw) {
    await preloadData();
  } else {
    // Fetch fresh data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:C',
    });

    cache.dataRaw = response.data.values || [];
    cache.dataMap = buildEmployeeMap(cache.dataRaw);
    cache.timestamp = now;
  }

  return cache.dataRaw!;
}

// Fast employee lookup using Map
async function getEmployeeFromCache(employeeId: string): Promise<{ mobile: string | null } | null> {
  if (!cache.dataMap) {
    await preloadData();
  }

  return cache.dataMap?.get(employeeId.trim()) || null;
}

// Helper to invalidate cache
function invalidateCache() {
  cache.dataRaw = null;
  cache.dataMap = null;
  cache.timestamp = 0;
  console.log('Cache invalidated');
}

// Background refresh - refresh cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(async () => {
    if (cache.dataRaw) {
      console.log('Background refresh of employee data...');
      await getSheetData(true);
    }
  }, 300000); // 5 minutes
}

export async function getEmployeeById(id: string): Promise<{ eligible: boolean; mobile: string | null }> {
  try {
    // Use fast Map-based lookup O(1) instead of array search O(n)
    const employee = await getEmployeeFromCache(id);

    if (!employee) {
      return { eligible: false, mobile: null };
    }

    return {
      eligible: true,
      mobile: employee.mobile,
    };
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw new Error('Failed to fetch employee data');
  }
}

export async function updateMobileNumber(employeeId: string, mobile: string): Promise<void> {
  try {
    // Use cached data to find row index faster
    const rows = await getSheetData();

    if (!rows || rows.length === 0) {
      throw new Error('Employee not found');
    }

    // Find the row index (1-based for Sheets API)
    const rowIndex = rows.findIndex(row => row[0]?.toString().trim() === employeeId.trim());

    if (rowIndex === -1) {
      throw new Error('Employee not found');
    }

    // Update column B (mobile number) for this row
    // Row index is 0-based in array, but 1-based in Sheets, so add 1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `B${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[mobile]],
      },
    });

    // Invalidate cache after update
    invalidateCache();
  } catch (error) {
    console.error('Error updating mobile number:', error);
    throw new Error('Failed to update mobile number');
  }
}

export async function addNewEmployee(employeeId: string, mobile: string, status: string): Promise<void> {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'A:C',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[employeeId, mobile, status]],
      },
    });

    // Invalidate cache after adding new employee
    invalidateCache();
  } catch (error) {
    console.error('Error adding new employee:', error);
    throw new Error('Failed to add new employee');
  }
}
