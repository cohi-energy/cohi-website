# Cohi Landing Page

A conversion-focused landing page for COHI, tailored to San Francisco multifamily residential audiences (HOAs, condo associations, and apartment operators) that need utility savings and benchmarking compliance support.

## Repository Ownership

This site is authored in `util-bill-app/website` and mirrored to `cohi-capital/cohi-website` for GitHub Pages deployment.

- **Source of truth:** `util-bill-app/website`
- **Deploy target:** `cohi-website/master`
- **Policy:** Direct edits in `cohi-website` are emergency-only and should be pulled back into `util-bill-app` with `git subtree`

## Setup

### Configuration

Configuration is handled via GitHub Secrets for production deployment (keeps API keys secure).

#### For Local Development:

Run the dev script:
```bash
./dev.sh
```

This handles everything automatically. If you need to manually configure, edit `config.js` with:
- `GOOGLE_APPS_SCRIPT_URL`: Your Google Apps Script Web App URL (see [Google Sheets Integration](#google-sheets-integration))
- `REDDIT_PIXEL_ID`: Your Reddit Pixel ID (optional, for ad tracking)
- `POSTHOG_API_KEY`: Your PostHog API key (starts with `phc_`)
- `POSTHOG_HOST`: `https://us.i.posthog.com`

**Note:** `config.js` is gitignored and will not be committed to the repository.

#### For Production (GitHub Pages):

Secrets are injected at build time in the standalone `cohi-website` repository after the subtree sync completes. See [Deploying to GitHub Pages](#deploying-to-github-pages) below.

### Google Sheets Integration

Form submissions are saved directly to Google Sheets via Google Apps Script.

#### Setup Steps:

1. **Create a Google Sheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Add headers in row 1: `Timestamp`, `Name`, `Email`, `Building Address`, `Message`, `Source`

2. **Create Google Apps Script**
   - In your Google Sheet, click **Extensions** → **Apps Script**
   - Paste this code:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.building_address || '',
      data.message || '',
      data.source || 'website_contact_form'
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'ok', message: 'Google Apps Script is working.'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Deploy as Web App**
   - Click **Deploy** → **New deployment** → **Web app**
   - Set **Execute as**: "Me"
   - Set **Who has access**: "Anyone"
   - Click **Deploy** and authorize when prompted
   - Copy the Web App URL (looks like `https://script.google.com/macros/s/xxx.../exec`)
   - For local dev: add to `config.js` as `GOOGLE_APPS_SCRIPT_URL`
   - For production: add as GitHub Secret `GOOGLE_APPS_SCRIPT_URL`

### Reddit Ads Integration

The site includes Reddit Pixel tracking for conversion optimization.

#### Setup:
1. Get your Reddit Pixel ID from [Reddit Ads](https://ads.reddit.com)
2. For local dev: add to `config.js` as `REDDIT_PIXEL_ID`
3. For production: add as GitHub Secret `REDDIT_PIXEL_ID`

Pixel tracking works client-side. For server-side conversion tracking via Reddit's Conversion API, you'd need a server-side proxy endpoint due to CORS restrictions.

### PostHog Analytics

The site includes PostHog analytics for user tracking with cross-subdomain support between cohi.energy and app.cohi.energy.

#### Features:
- **Cross-subdomain tracking**: Users are tracked as the same person across cohi.energy and app.cohi.energy
- **Automatic pageviews**: Page visits are captured automatically
- **Autocapture**: Button clicks and link interactions are tracked automatically
- **Do Not Track respect**: Honors browser DNT settings

#### Setup:
1. Get your PostHog API key from [PostHog](https://posthog.com) (starts with `phc_`)
2. For local dev: add to `config.js`:
   - `POSTHOG_API_KEY` - Your API key
   - `POSTHOG_HOST` - `https://us.i.posthog.com`
3. For production: add as GitHub Secrets (see [Deploying to GitHub Pages](#deploying-to-github-pages))

#### PostHog Dashboard Config:
Ensure both domains are in the Authorized Domains list:
- `https://cohi.energy`
- `https://app.cohi.energy`

#### Helper Functions:
- `trackCTAClick(destination, ctaLocation)` - Track CTA button clicks (for future app.cohi.energy links)
- `trackPostHogEvent(eventName, properties)` - Track custom events

## Viewing Locally

All day-to-day website development now happens from `util-bill-app/website`.

### Quick Start (Recommended)
```bash
./dev.sh
```

This script will:
1. Create `config.js` from template if it doesn't exist
2. Prompt you to fill in credentials if needed
3. Start a local server on `http://localhost:${PORT:-8000}`

If `8000` is already in use:

```bash
PORT=8001 ./dev.sh
```

### Editing Workflow

This site is plain HTML, CSS, and JavaScript. There is no Vite-style hot module reloading for `website/`.

- Edit files in `website/`
- Save your changes
- Refresh the browser to see the update immediately
- Keep `config.js` local and uncommitted

### Animated Card Bundle

The 12 impact / service-grid card animations are React + framer-motion components
bundled into a single self-mounting IIFE: `dist/cards-bundle.js`.

- **Source:** `cards-src/` (entry + tokens + per-pattern components)
- **Build:** `npm install` once, then `npm run build` (Vite, ~1s, ~100 KB gzipped output)
- **Output:** `dist/cards-bundle.js` (committed — GitHub Pages serves it as a static asset)
- **Mounting:** `index.html` includes the bundle with `<script src="dist/cards-bundle.js" defer>`. The bundle scans for `<div data-cohi-card="…">` mount points (one per card id: `cost`, `waste`, `compliance`, `savings`, `bill-crush`, `usage-boulder`, `incentive-scan`, `compliance-scan`, `benchmark-mail`, `retrofit-bulb`, `hoa-catch`, `retrofit-balance`) and renders the picked React pattern into each. A `MutationObserver` picks up mount points added later by `script.js` (services-fresh resident / property-manager grids).
- **Per-card pick:** edit `cards-src/v2/tokens.ts` → `CARD_PICK`.

**Whenever you change a `cards-src/**` file, re-run `npm run build` and commit the updated `dist/cards-bundle.js`.** `npm run watch` rebuilds on save.

### Optional Live Reload

If you want automatic browser refresh while editing, run:

```bash
npx browser-sync start --server --files "*.html,*.css,*.js,assets/**/*" --startPath index.html --port 8001 --no-open
```

This is optional and separate from `./dev.sh`.

### Manual Setup
If you prefer manual setup:

1. Copy template: `cp config.template.js config.js`
2. Edit `config.js` with your credentials
3. Start server:
   ```bash
   python3 -m http.server 8000
   # or
   npx http-server -p 8000
   ```
4. Open http://localhost:8000

## Deploying to GitHub Pages

Deployment is automated via GitHub Actions. The workflow injects secrets at build time, keeping API keys secure.

### Source of Truth

Day-to-day website changes should be made in `util-bill-app/website`, not directly in `cohi-website`.

1. Edit files under `util-bill-app/website`
2. Merge those changes to `util-bill-app/main`
3. Let `.github/workflows/sync-website-subtree.yml` mirror the subtree to `cohi-website/master`
4. Let the standalone `cohi-website` GitHub Pages workflow deploy the updated site

If the subtree sync ever fails, first verify that `SUBREPO_PAT` is present in `util-bill-app` and still has write access to `cohi-capital/cohi-website`.

### Initial Setup (One-time)

1. **Add GitHub Secrets**
   - Go to the `cohi-website` repository on GitHub
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `GOOGLE_APPS_SCRIPT_URL` - Your Google Apps Script Web App URL
     - `REDDIT_PIXEL_ID` - Your Reddit Pixel ID
     - `POSTHOG_API_KEY` - Your PostHog API key (starts with `phc_`)
     - `POSTHOG_HOST` - PostHog host URL (`https://us.i.posthog.com`)

2. **Enable GitHub Pages with Actions**
   - In `cohi-website`, go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Add subtree sync secret**
   - In `util-bill-app`, go to **Settings** → **Secrets and variables** → **Actions**
   - Add `SUBREPO_PAT` with push access to `cohi-capital/cohi-website`

### Deploying

Normal deployments flow through `util-bill-app`:

```bash
git add website
git commit -m "Update marketing site"
git push origin main
```

The sync workflow will push `website/` to `cohi-website/master`, and the standalone repository will then deploy to GitHub Pages.

### Emergency Recovery

If someone makes an emergency fix directly in `cohi-website`, pull it back into `util-bill-app` immediately:

```bash
git remote add cohi-website https://github.com/cohi-capital/cohi-website.git
git fetch cohi-website master
git subtree pull --prefix=website cohi-website master --squash
```

### Emergency Direct Deploys

Direct pushes to `cohi-website/master` still trigger Pages deployment, but they should be treated as exceptions:

```bash
# Run in the standalone cohi-website repository
git add .
git commit -m "Emergency website fix"
git push origin master
```

After any emergency direct deploy, sync the fix back into `util-bill-app/website` so the canonical source does not drift.

The `cohi-website` GitHub Action will:
1. Generate `config.js` from secrets
2. Deploy to GitHub Pages

Your site will be live at: `https://cohi.energy` (or your configured domain)

## File Structure

```
util-bill-app/website/
├── index.html           # Main HTML file
├── styles.css           # Stylesheet
├── script.js            # JavaScript for form handling and navigation
├── reddit-pixel.js      # Reddit Pixel tracking code
├── posthog.js           # PostHog analytics tracking
├── config.template.js   # Config template with placeholders (committed)
├── config.js            # Local generated config with secrets (gitignored)
├── dev.sh               # Local development script
├── assets/branding/     # Brand logos (logo_white.svg, logo_grey.svg)
├── .github/
│   └── workflows/
│       └── deploy.yml   # Workflow mirrored to cohi-website for GitHub Pages deploys
└── README.md            # This file
```

## Contact Form

The contact form saves submissions to Google Sheets.

Required fields:
- Name
- Email
- Building address

Optional field:
- Message
