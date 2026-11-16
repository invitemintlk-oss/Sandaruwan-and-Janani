/**
 * Sandaruwan & Janani — Wedding RSVP + Wishes → Google Sheets
 *
 * Writes to two separate tabs, created automatically with styled headers:
 *   • "RSVP"   – Timestamp | Name | Attendance | Guests | Dietary Notes | Invited As
 *   • "Wishes" – Timestamp | Name | Message | Invited As
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me   |   Who has access: Anyone
 * The /exec URL is set in src/config.ts (APPS_SCRIPT_URL).
 */

const SPREADSHEET_ID = '1O65cidRgd7bIf7DiWYmUtd2NAIdpdrYHHjooX3rh2qk';
const TIMEZONE = 'Asia/Colombo';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Name', 'Attendance', 'Guests', 'Dietary Notes', 'Invited As'],
    widths: [170, 220, 130, 80, 300, 200],
    row: (p) => [
      now_(),
      clean_(p.name),
      clean_(p.attendance),
      clean_(p.guests),
      clean_(p.dietaryNotes),
      clean_(p.invitedAs),
    ],
    required: ['name', 'attendance'],
  },
  WISH: {
    name: 'Wishes',
    headers: ['Timestamp', 'Name', 'Message', 'Invited As'],
    widths: [170, 220, 480, 200],
    row: (p) => [now_(), clean_(p.name), clean_(p.message), clean_(p.invitedAs)],
    required: ['name', 'message'],
  },
};

const HEADER_BG = '#c76f55'; // deep peach
const HEADER_FG = '#ffffff';
const BAND_BG = '#fff3ec';   // light peach banding

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
    sheet.appendRow(config.row(payload));

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/** Health check — open the /exec URL in a browser to confirm it's live. */
function doGet() {
  return json_({ ok: true, message: 'Sandaruwan & Janani wedding endpoint is running.' });
}

/** Run once from the editor (▶ setup) to create both tabs and authorise the script. */
function setup() {
  Object.keys(SHEETS).forEach((k) => getSheet_(SHEETS[k]));
}

// ───────────────────────── helpers ─────────────────────────

function getSheet_(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(config.name);
  if (!sheet) sheet = ss.insertSheet(config.name);

  const needsHeaders =
    sheet.getLastRow() === 0 ||
    String(sheet.getRange(1, 1).getValue()).trim() !== config.headers[0];

  if (needsHeaders) {
    if (sheet.getLastRow() > 0) sheet.insertRowBefore(1);
    const header = sheet.getRange(1, 1, 1, config.headers.length);
    header
      .setValues([config.headers])
      .setFontWeight('bold')
      .setFontColor(HEADER_FG)
      .setBackground(HEADER_BG)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    sheet.setRowHeight(1, 32);
    sheet.setFrozenRows(1);
    config.widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

    // Wrap long text columns, banding for readability
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, config.headers.length)
      .setWrap(true)
      .setVerticalAlignment('top');
    try {
      sheet.getRange(1, 1, sheet.getMaxRows(), config.headers.length)
        .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
        .setHeaderRowColor(HEADER_BG)
        .setFirstRowColor('#ffffff')
        .setSecondRowColor(BAND_BG);
    } catch (_) {
      // Banding already exists — ignore
    }
  }
  return sheet;
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

function now_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
