# Connect RSVP + Wishes to Google Sheets

Sheet: https://docs.google.com/spreadsheets/d/1O65cidRgd7bIf7DiWYmUtd2NAIdpdrYHHjooX3rh2qk/edit

The script creates two tabs automatically, each with a styled peach header row:

| Tab      | Columns                                                          |
| -------- | ---------------------------------------------------------------- |
| `RSVP`   | Timestamp, Name, Guest Of, Attendance, Guests, Kids (Below 10), Dietary Notes, Invited As |
| `Wishes` | Timestamp, Name, Message, Invited As                             |

"Invited As" is filled from the personalised link (e.g. `Mr. Sanjaya`), so you can see who replied from which invitation.

## Steps

1. Open the sheet → **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste the full contents of [`code.gs`](./code.gs). Save.
3. In the function dropdown pick **`setup`** → **Run**. Approve the permissions prompt
   (Advanced → Go to project → Allow). The `RSVP` and `Wishes` tabs appear with headers.
4. **Deploy → New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy**, then copy the **Web app URL** (ends in `/exec`).
5. The current URL is already hardcoded in `src/config.ts` (`APPS_SCRIPT_URL`). Only change it if you create a *new* deployment.

To check it's live, open the `/exec` URL in a browser. It should say
`"Sandaruwan & Kavindya wedding endpoint is running."`

**If you edit `code.gs` later:** go to Deploy → Manage deployments → ✏️ → Version: *New version* → Deploy.
The URL stays the same.
