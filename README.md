# Cohi Landing Page

A conversion-focused landing page for COHI, tailored to San Francisco multifamily residential audiences (HOAs, condo associations, and apartment operators) that need utility savings and benchmarking compliance support.

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

Secrets are injected at build time via GitHub Actions. See [Deploying to GitHub Pages](#deploying-to-github-pages) below.

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

### Quick Start (Recommended)
```bash
./dev.sh
```

This script will:
1. Create `config.js` from template if it doesn't exist
2. Prompt you to fill in credentials if needed
3. Start a local server on http://localhost:8000

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

### Initial Setup (One-time)

1. **Add GitHub Secrets**
   - Go to your repository on GitHub
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `GOOGLE_APPS_SCRIPT_URL` - Your Google Apps Script Web App URL
     - `REDDIT_PIXEL_ID` - Your Reddit Pixel ID
     - `POSTHOG_API_KEY` - Your PostHog API key (starts with `phc_`)
     - `POSTHOG_HOST` - PostHog host URL (`https://us.i.posthog.com`)

2. **Enable GitHub Pages with Actions**
   - Go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

### Deploying

Push to the `master` branch to trigger automatic deployment:
```bash
git add .
git commit -m "Your commit message"
git push origin master
```

The GitHub Action will:
1. Generate `config.js` from secrets
2. Deploy to GitHub Pages

Your site will be live at: `https://cohi.energy` (or your configured domain)

## File Structure

```
cohi-website/
├── index.html           # Main HTML file
├── styles.css           # Stylesheet
├── script.js            # JavaScript for form handling and navigation
├── reddit-pixel.js      # Reddit Pixel tracking code
├── posthog.js           # PostHog analytics tracking
├── config.template.js   # Config template with placeholders (committed)
├── config.js            # Generated config with secrets (gitignored)
├── dev.sh               # Local development script
├── assets/branding/     # Brand logos (logo_white.svg, logo_grey.svg)
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions deployment workflow
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
