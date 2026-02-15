import { google } from 'googleapis';

// Support both individual env vars and full JSON credentials
let credentials;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  // Use full JSON credentials (recommended for Vercel)
  try {
    const jsonString = Buffer.from(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      'base64'
    ).toString('utf-8');
    credentials = JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse service account JSON:', error);
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON');
  }
} else {
  // Fallback to individual environment variables
  function parsePrivateKey(key: string | undefined): string | undefined {
    if (!key) return undefined;
    let parsedKey = key;

    // Check if it's base64 encoded
    if (!parsedKey.includes('BEGIN PRIVATE KEY') && parsedKey.length > 100) {
      try {
        parsedKey = Buffer.from(parsedKey, 'base64').toString('utf-8');
      } catch (e) {
        console.error('Failed to decode base64 key:', e);
      }
    }

    // Handle escaped newlines
    if (parsedKey.includes('\\n')) {
      parsedKey = parsedKey.replace(/\\n/g, '\n');
    }

    parsedKey = parsedKey.replace(/^["']|["']$/g, '');
    return parsedKey;
  }

  credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  };
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Type for Google Sheets row data
type SheetRow = (string | number | boolean)[];

// Use globalThis to persist cache across Next.js hot reloads in dev mode
declare global {
  var employeeCache: {
    dataMap: Map<string, { mobile: string | null }> | null;
    dataRaw: SheetRow[] | null;
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
function buildEmployeeMap(rows: SheetRow[]): Map<string, { mobile: string | null }> {
  const map = new Map<string, { mobile: string | null }>();

  // Skip header row (index 0) and process data rows only
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[0]) {
      // Normalize: trim whitespace and convert to uppercase for case-insensitive matching
      const employeeId = row[0].toString().trim().toUpperCase();
      const mobile = row[1]?.toString().trim() || null;

      // Only add if employeeId is not empty after trimming
      if (employeeId) {
        map.set(employeeId, { mobile });
      }
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

    cache.dataRaw = (response.data.values as SheetRow[]) || [];
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
async function getSheetData(forceRefresh = false): Promise<SheetRow[]> {
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

    cache.dataRaw = (response.data.values as SheetRow[]) || [];
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

  // Normalize search input: trim and uppercase for case-insensitive matching
  return cache.dataMap?.get(employeeId.trim().toUpperCase()) || null;
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

    // Find the row index (1-based for Sheets API) - case-insensitive
    const normalizedSearchId = employeeId.trim().toUpperCase();
    const rowIndex = rows.findIndex(row =>
      row[0]?.toString().trim().toUpperCase() === normalizedSearchId
    );

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

// ==================== ACTIVITY LOG FUNCTIONS ====================

const ACTIVITY_LOG_SHEET_NAME = 'Activity Log';

// Ensure Activity Log sheet exists with proper headers
async function ensureActivityLogSheet(): Promise<void> {
  try {
    // Get all sheets in the spreadsheet
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === ACTIVITY_LOG_SHEET_NAME
    );

    if (!sheetExists) {
      // Create the Activity Log sheet
      console.log('Creating Activity Log sheet...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: ACTIVITY_LOG_SHEET_NAME,
                },
              },
            },
          ],
        },
      });

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${ACTIVITY_LOG_SHEET_NAME}!A1:E1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', 'Employee ID', 'Eligible', 'Mobile Number', 'Action']],
        },
      });

      console.log('Activity Log sheet created successfully');
    }
  } catch (error) {
    console.error('Error ensuring Activity Log sheet exists:', error);
    // Don't throw - we'll still try to log even if sheet check fails
  }
}

// Log activity to Activity Log sheet
export async function logActivity(
  employeeId: string,
  eligible: boolean,
  mobile: string | null,
  action: 'Checked' | 'Mobile Added' | 'Mobile Updated'
): Promise<void> {
  try {
    // Ensure the sheet exists
    await ensureActivityLogSheet();

    // Format timestamp in readable format (ISO 8601)
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Prepare row data
    const rowData = [
      timestamp,
      employeeId,
      eligible ? 'Yes' : 'No',
      mobile || '-',
      action,
    ];

    // Append to Activity Log sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${ACTIVITY_LOG_SHEET_NAME}!A:E`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    console.log(`Activity logged: ${employeeId} - ${action} - ${eligible ? 'Eligible' : 'Not Eligible'}`);
  } catch (error) {
    // Log error but don't throw - activity logging should not break main functionality
    console.error('Error logging activity:', error);
  }
}
