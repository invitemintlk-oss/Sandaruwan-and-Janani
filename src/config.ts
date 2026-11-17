// Single source of truth for this wedding's details.
export const WEDDING = {
  groomName: 'Sandaruwan',
  brideName: 'Kavindya',
  groomFullName: 'T L Sandaruwan Peiris',
  brideFullName: 'Kavindya Janani Hettige',
  groomParents: ['Mr. Chandrasiri Peiris', 'Mrs. Kankanamge Sriyani'],
  brideParents: ['Mr. Hettige Nihal', 'Mrs. Thilaka Madagama Liyanage'],
  // Poruwa ceremony start, Sri Lanka time (UTC+05:30)
  date: new Date('2026-12-24T17:00:00+05:30'),
  dayLong: 'Thursday, 24th December 2026',
  dateDots: '24 . 12 . 2026',
  venue: 'Grand Ballroom',
  hotel: "Waters Edge Hotel",
  city: 'Battaramulla',
  gardenArea: "Waters Edge Garden Area",
  mapsQuery: 'Waters Edge, Battaramulla, Sri Lanka',
};

export type Prefix = 'Mr.' | 'Mrs.' | 'Miss' | 'Mr. & Mrs.' | 'Family' | 'Dear';
export const PREFIXES: Prefix[] = ['Mr.', 'Mrs.', 'Miss', 'Mr. & Mrs.', 'Family', 'Dear'];

/** Combine prefix + name. "Dear" is a greeting style, so it adds nothing to the name. */
export function buildDisplayName(prefix: Prefix, rawName: string): string {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (!name) return '';
  switch (prefix) {
    case 'Family':
      return `${name} and Family`;
    case 'Dear':
      return name;
    default:
      return `${prefix} ${name}`;
  }
}

/** Read the guest's display name from the URL path, e.g. /Mr.%20Sanjaya → "Mr. Sanjaya". */
export function getGuestFromPath(pathname: string): string | null {
  const segment = pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  if (!segment || segment.toLowerCase() === 'admin') return null;
  try {
    const decoded = decodeURIComponent(segment).trim();
    // Keep it to something reasonable to render
    return decoded ? decoded.slice(0, 80) : null;
  } catch {
    return null;
  }
}

// ── Google Sheets (RSVP + Wishes) ──────────────────────────────
// Apps Script Web App URL (google-apps-script/code.gs deployment).
export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyWscK2YUkkAwZ4cU2SYDSGL4hzUOJbsbt4QkK1Xnzqa2zF6AhKJn9e1TDkfJCev11e/exec';

/** Send a row to the Google Sheet. Resolves on success, throws on failure. */
export async function submitToSheet(sheet: 'RSVP' | 'WISH', data: Record<string, string>) {
  if (!APPS_SCRIPT_URL) throw new Error('Google Sheet URL is not configured');
  const invitedAs = getGuestFromPath(window.location.pathname) || '';
  // text/plain avoids a CORS preflight, which Apps Script can't answer
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ sheet, invitedAs, ...data }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) throw new Error(json?.error || `Request failed (${res.status})`);
}

export const MUSIC_URL = '/' + encodeURIComponent('Brooklyn Duo - A Thousand Years [WEDDING VERSION].mp3');
