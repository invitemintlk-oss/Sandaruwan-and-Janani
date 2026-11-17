/**
 * Sandaruwan & Kavindya — Wedding RSVP + Wishes → Google Sheets
 *
 * Writes to two separate tabs, created automatically with styled headers:
 *   • "RSVP"   – Timestamp | Name | Attendance | Guests | Kids (Below 10) | Dietary Notes | Invited As
 *   • "Wishes" – Timestamp | Name | Message | Invited As
 *
 * Existing tabs are upgraded automatically: any missing column (e.g. "Kids (Below 10)")
 * is inserted in the right place, and rows are written by header name.
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me   |   Who has access: Anyone
 * The /exec URL is set in src/config.ts (APPS_SCRIPT_URL).
 * After editing this file: Deploy → Manage deployments → ✏️ → Version: New version → Deploy.
 */

const SPREADSHEET_ID = '1O65cidRgd7bIf7DiWYmUtd2NAIdpdrYHHjooX3rh2qk';
const TIMEZONE = 'Asia/Colombo';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    columns: [
      { header: 'Timestamp',       width: 170, value: () => now_() },
      { header: 'Name',            width: 220, value: (p) => clean_(p.name) },
      { header: 'Attendance',      width: 130, value: (p) => clean_(p.attendance) },
      { header: 'Guests',          width: 80,  value: (p) => num_(p.guests) },
      { header: 'Kids (Below 10)', width: 120, value: (p) => num_(p.kids) },
      { header: 'Dietary Notes',   width: 300, value: (p) => clean_(p.dietaryNotes) },
      { header: 'Invited As',      width: 200, value: (p) => clean_(p.invitedAs) },
    ],
    required: ['name', 'attendance'],
  },
  WISH: {
    name: 'Wishes',
    columns: [
      { header: 'Timestamp',  width: 170, value: () => now_() },
      { header: 'Name',       width: 220, value: (p) => clean_(p.name) },
      { header: 'Message',    width: 480, value: (p) => clean_(p.message) },
      { header: 'Invited As', width: 200, value: (p) => clean_(p.invitedAs) },
    ],
    required: ['name', 'message'],
  },
};

const HEADER_BG = '#b45a40'; // deep peach
const HEADER_FG = '#ffffff';
const BAND_BG = '#fbe9de';   // light peach banding

/** Receives form submissions from the invitation website. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const payload = parsePayload_(e);
    const key = String(payload.sheet || '').toUpperCase();
    const config = SHEETS[key];
    if (!config) {
      return json_({ ok: false, error: 'Invalid sheet. Use RSVP or WISH.' });
    }

    const missing = config.required.filter((f) => !String(payload[f] || '').trim());
    if (missing.length) {
      return json_({ ok: false, error: 'Missing fields: ' + missing.join(', ') });
    }

    const sheet = getSheet_(config);

    // Write values by header name so column order in the sheet never matters
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const row = headers.map((h) => {
      const col = config.columns.find((c) => c.header === h);
      return col ? col.value(payload) : '';
    });
    sheet.appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** Health check — open the /exec URL in a browser to confirm it's live. */
function doGet() {
  return json_({ ok: true, message: 'Sandaruwan & Kavindya wedding endpoint is running.' });
}

/** Run once from the editor (▶ setup) to create/upgrade both tabs and authorise the script. */
function setup() {
  Object.keys(SHEETS).forEach((k) => getSheet_(SHEETS[k]));
}

// ───────────────────────── helpers ─────────────────────────

function getSheet_(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(config.name);
  const isNew = !sheet;
  if (isNew) sheet = ss.insertSheet(config.name);

  const wanted = config.columns.map((c) => c.header);

  // Brand-new or empty tab: write all headers at once
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, wanted.length).setValues([wanted]);
    styleSheet_(sheet, config);
    return sheet;
  }

  // Existing tab whose first row isn't a header row: insert one on top
  if (String(sheet.getRange(1, 1).getValue()).trim() !== wanted[0]) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, wanted.length).setValues([wanted]);
    styleSheet_(sheet, config);
    return sheet;
  }

  // Existing header row: insert any missing columns in their intended position
  let changed = false;
  wanted.forEach((header, i) => {
    const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
    if (current.indexOf(header) !== -1) return;
    const prev = i > 0 ? current.indexOf(wanted[i - 1]) : -1; // 0-based
    const insertAt = prev >= 0 ? prev + 2 : current.length + 1; // 1-based column
    if (insertAt <= sheet.getLastColumn()) {
      sheet.insertColumnBefore(insertAt);
    }
    sheet.getRange(1, insertAt).setValue(header);
    changed = true;
  });
  if (changed) styleSheet_(sheet, config);
  return sheet;
}

function styleSheet_(sheet, config) {
  const lastCol = sheet.getLastColumn();
  sheet.getRange(1, 1, 1, lastCol)
    .setFontWeight('bold')
    .setFontColor(HEADER_FG)
    .setBackground(HEADER_BG)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  headers.forEach((h, i) => {
    const col = config.columns.find((c) => c.header === h);
    if (col) sheet.setColumnWidth(i + 1, col.width);
  });

  if (sheet.getMaxRows() > 1) {
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, lastCol)
      .setWrap(true)
      .setVerticalAlignment('top');
  }

  // Re-apply peach banding across all columns
  sheet.getBandings().forEach((b) => b.remove());
  sheet.getRange(1, 1, sheet.getMaxRows(), lastCol)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(HEADER_BG)
    .setFirstRowColor('#ffffff')
    .setSecondRowColor(BAND_BG);
}

function parsePayload_(e) {
  const params = (e && e.parameter) || {};
  const contents = e && e.postData && e.postData.contents ? e.postData.contents : '';

  if (contents) {
    try {
      return JSON.parse(contents);
    } catch (_) {
      // Not JSON — fall through to form-encoded parameters
    }
  }
  return params;
}

function clean_(value) {
  let s = String(value == null ? '' : value).trim().slice(0, 2000);
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function num_(value) {
  const n = parseInt(value, 10);
  return isNaN(n) || n < 0 ? 0 : Math.min(n, 20);
}

function now_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
