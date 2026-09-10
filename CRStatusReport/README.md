# CR Status Report

A status report site for the Commercial Readiness team: up to five (or six)
people submit weekly updates, and the site layers everyone's entries into one
shared report per week — with a permanent history of every past week.

The site itself is static and hosts on GitHub Pages for free. The **backend**
that gives it real, shared, historical storage is **Firebase Firestore**
(also free at this scale). GitHub Pages can only serve files, not accept
writes — so a small external database is required for anything to actually
be "shared" or "historical." Firestore is a hosted database you call directly
from the browser; there's no server to run or maintain.

## How data is structured

- One Firestore document per week: `weeklyReports/<week-of-date>`, e.g.
  `weeklyReports/2026-09-09`. A new week is a brand-new document — nothing
  is ever overwritten across weeks, so history is automatic and permanent.
- Inside each week's document, an `entries` map holds one slice per person:
  `entries.barry`, `entries.laura`, etc. Submissions write only their own
  slice (`entries.<name>`), so up to five or six people's inputs layer into
  the same shared record without anyone clobbering anyone else's entry.
- Every submission is also appended to that week's `history` subcollection,
  which is never edited or deleted — so even if someone updates their entry
  twice in one week, both versions are preserved for audit purposes.

## Pages

- **`update.html`** — the submission form. Pick your name, get prompted
  project-by-project ("check Outlook, Teams, status reports, meeting
  notes"), and click **Submit to shared report** to write your entry
  straight into that week's Firestore document. A **Download a local
  backup copy** button also saves a JSON file to your computer as a
  fallback if the connection fails.
- **`index.html`** — the combined report. A **Week of** dropdown lists every
  week that has ever been submitted (most recent first); selecting one
  loads that week's document and renders it in the same layout as the
  original Word report (section bands, item headings, Out of Office and
  Sign Off tables).
- **`seed.html`** — a one-time importer that loads the six starter files in
  `/data` (this week's real content, carried over from the original report)
  into Firestore, so the combined report has real data the first time you
  open it.

## One-time setup

### 1. Create a Firebase project (free tier is enough for this)

1. Go to <https://console.firebase.google.com> → **Add project** → give it
   any name (e.g. `cr-status-report`) → finish the wizard (Google Analytics
   is optional, skip it).
2. In the left sidebar, go to **Build → Firestore Database → Create
   database**. Choose **Start in production mode** and pick any region
   close to your team.
3. In the left sidebar, go to **Project settings** (gear icon) → scroll to
   **Your apps** → click the **</>** (web) icon → register an app (any
   nickname) → you don't need Firebase Hosting, skip that checkbox.
4. Copy the `firebaseConfig` object it shows you.

### 2. Wire the config into the site

Open `assets/firebase-config.js` and paste your values in, replacing the
`"REPLACE_ME"` placeholders. These values are not secret — they're meant to
ship in client-side code — access control is handled by the security rules
below, not by hiding this file.

### 3. Set Firestore security rules

In the Firebase console: **Firestore Database → Rules**, replace the
contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weeklyReports/{weekOf} {
      allow read: if true;
      allow write: if request.resource.data.keys().hasOnly(['weekOf', 'updatedAt', 'entries']);

      match /history/{entryId} {
        allow read: if true;
        allow create: if true;
        allow update, delete: if false;   // history is append-only
      }
    }
  }
}
```

Click **Publish**. Note the honest trade-off: with no login step, anyone who
has the site's URL can read and submit entries — there's no per-person
authentication yet. For a small internal team this is often an acceptable
trade-off (nothing here is sensitive), but if you want real access control,
the next step is adding Firebase Authentication (e.g. Google sign-in
restricted to your company email domain) and tightening these rules to
require `request.auth != null`. That's a follow-up, not required to get
this working.

### 4. Import this week's existing data (optional, one time)

Open `seed.html` on the published site (or locally via a static server —
see Notes) and click **Run one-time import**. This loads the six files in
`/data` into Firestore under the week of 2026-09-09, so the combined report
isn't empty on day one.

### 5. Publish on GitHub Pages

1. Push this folder to a GitHub repo (e.g. `CRStatusReport`).
2. **Settings → Pages** → **Source**: "Deploy from a branch", branch `main`,
   folder `/ (root)` → **Save**.
3. Site publishes at `https://<your-username>.github.io/CRStatusReport/`.
4. Share `.../update.html` with the team for submissions, and the root URL
   for the combined, historical report.

## Weekly workflow

1. Each person opens `update.html`, selects their name, and fills in only
   the projects they touched this week.
2. They check the confirmation box and click **Submit to shared report** —
   their entry is written into that week's shared Firestore document
   immediately, alongside anyone else who has already submitted.
3. Anyone can open `index.html` at any time to see the current week's
   report update live, or use the **Week of** dropdown to look back at any
   past week.
4. Next week, everyone just repeats step 1 with a new "Week of" date —
   Firestore automatically creates a new document, and the old week stays
   exactly as it was.

## Editing the project list

All project names/groups live in one place: `assets/projects.js`. Add,
rename, or reorder items there and both pages stay in sync automatically.

## Notes

- Opening the HTML files directly from disk (`file://`) can hit browser
  restrictions on ES module imports. Test either on the published GitHub
  Pages URL, or locally via a static server, e.g. `python3 -m http.server`
  from this folder, then visit `http://localhost:8000`.
- The `/data/*.json` files are now only used by `seed.html` for the initial
  import — the live site reads and writes Firestore directly, not these
  files. They're kept in the repo as a record of the original migration.
- Firestore's free ("Spark") tier includes 50K document reads and 20K writes
  per day, which is far more than a 5-6 person weekly report will ever use.
