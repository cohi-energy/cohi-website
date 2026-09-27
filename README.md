# Cohi Landing Page

The marketing site for Cohi's bill-optimization app: free rate-plan checking and switching for homes and small businesses, and portfolio-wide energy-spend screening for multifamily owners and operators. Primary conversion is app signup (`app.cohi.energy/register`); secondary is the portfolio-review contact form.

## Repository Ownership

This site is authored in `cohi/website` and mirrored to `cohi-energy/cohi-website` for GitHub Pages deployment.

- **Source of truth:** `cohi/website`
- **Deploy target:** `cohi-website/master`
- **Policy:** Direct edits in `cohi-website` are emergency-only and should be pulled back into `cohi` with `git subtree`

## Setup

### Configuration

Configuration is handled via GitHub Secrets for production deployment (keeps API keys secure).

#### For Local Development:

Run the dev script:
```bash
./dev.sh
```

This handles everything automatically. If you need to manually configure, edit `config.js` with:
- `REDDIT_PIXEL_ID`: Your Reddit Pixel ID (optional, for ad tracking)
- `POSTHOG_API_KEY`: Your PostHog API key (starts with `phc_`)
- `POSTHOG_HOST`: `https://us.i.posthog.com`

**Note:** `config.js` is gitignored and will not be committed to the repository.

#### For Production (GitHub Pages):

Secrets are injected at build time in the standalone `cohi-website` repository after the subtree sync completes. See [Deploying to GitHub Pages](#deploying-to-github-pages) below.

### Contact Form

The contact form posts to the app's own API, which stores the submission and
emails it to us. It needs no configuration here: `navigation.js` resolves the
app origin at runtime (`https://app.cohi.energy` in production).

`POST /api/contact/submissions` persists the submission, emails the whole thing
to the team with `reply_to` set to the visitor, and sends the visitor a branded
acknowledgement. The handler in `script.js` inspects the response and only shows
success when the app accepted it.

This replaced a Google Apps Script Web App that appended a row to a Google
Sheet. That path sent no mail, silently dropped the phone number, and was posted
to with `mode: 'no-cors'`, so its response was opaque and a failed write still
showed the visitor a success message. Do not reintroduce a `no-cors` sink here.

Submissions are visible in the app's admin dashboard, in the **Contact**
section. Full reference: [docs/website-contact-form.md](https://github.com/cohi-energy/cohi/blob/main/docs/website-contact-form.md).

To exercise the form locally you need the API running, because the form now
posts to it. From this directory:

```bash
(cd .. && ./scripts/dc.sh up -d)
```

```bash
./dev.sh
```

Two details worth stating: `./scripts/dc.sh` lives at the repository root, not
here, so it needs the `cd ..`. And the stack takes port 8000 for the API, which
is why `./dev.sh` serves on 8001 by default. Any port except 5173 and 5174 (the
app's own, which navigation.js maps back to the marketing site) works for the
form: it posts through the Vite dev server on 5173, which proxies `/api` and answers CORS
for any `localhost` origin itself. If your stack serves the frontend over HTTPS
(`DEV_APP_SCHEME=https` or local certificates), set
`APP_BASE_URL = 'https://localhost:5173'` in `config.js`: the page otherwise
copies its own `http` scheme and posts to a TLS listener over plain HTTP.

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
- **Privacy-safe explicit events**: Autocapture and session recording are disabled; CTA and contact events are tracked explicitly
- **Do Not Track respect**: Honors browser DNT settings
- **Lead/account correlation**: Contact form submissions set PostHog person email/name properties for operator lookup and call the app's lead-correlation endpoint when available. The endpoint returns `lead_id` and an HMAC email hash; it must not block form submission if unavailable.

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

All day-to-day website development now happens from `cohi/website`.

### Quick Start (Recommended)
```bash
./dev.sh
```

This script will:
1. Create `config.js` from template if it doesn't exist
2. Prompt you to fill in credentials if needed
3. Start a local server on `http://localhost:${PORT:-8001}`

To serve on another port:

```bash
PORT=8002 ./dev.sh
```

### Editing Workflow

This site is plain HTML, CSS, and JavaScript. There is no Vite-style hot module reloading for `website/`.

- Edit files in `website/`
- Save your changes
- Refresh the browser to see the update immediately
- Keep `config.js` local and uncommitted

### Section Animations

All section animations (hero skyline, bill-to-chart, plan-compare deck, admin checklist, monitoring timeline, house fill) are hand-written CSS/SVG driven by `script.js` scroll observers. There is no build step; edit `styles.css` and refresh.

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
   python3 -m http.server 8001
   # or
   npx http-server -p 8001
   ```
4. Open http://localhost:8001

## Deploying to GitHub Pages

Deployment is automated via GitHub Actions. The workflow injects secrets at build time, keeping API keys secure.

### Source of Truth

Day-to-day website changes should be made in `cohi/website`, not directly in `cohi-website`.

1. Edit files under `cohi/website`
2. Merge those changes to `cohi/main`
3. Let `.github/workflows/sync-website-subtree.yml` mirror the subtree to `cohi-website/master`
4. Let the standalone `cohi-website` GitHub Pages workflow deploy the updated site

If the subtree sync ever fails, first verify that `SUBREPO_PAT` is present in `cohi`, still has write access to `cohi-energy/cohi-website`, and carries both the `repo` and `workflow` scopes (the mirror includes `.github/workflows/deploy.yml`, which a token without `workflow` scope cannot push).

### Initial Setup (One-time)

1. **Add GitHub Secrets**
   - Go to the `cohi-website` repository on GitHub
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `REDDIT_PIXEL_ID` - Your Reddit Pixel ID
     - `POSTHOG_API_KEY` - Your PostHog API key (starts with `phc_`)
     - `POSTHOG_HOST` - PostHog host URL (`https://us.i.posthog.com`)

2. **Enable GitHub Pages with Actions**
   - In `cohi-website`, go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Add subtree sync secret**
   - In `cohi`, go to **Settings** → **Secrets and variables** → **Actions**
   - Add `SUBREPO_PAT` with push access to `cohi-energy/cohi-website` (`repo` + `workflow` scopes; `workflow` is needed to push the mirrored deploy workflow file)

### Deploying

Normal deployments flow through `cohi`:

```bash
git add website
git commit -m "Update marketing site"
git push origin main
```

The sync workflow will push `website/` to `cohi-website/master`, and the standalone repository will then deploy to GitHub Pages.

### Emergency Recovery

If someone makes an emergency fix directly in `cohi-website`, pull it back into `cohi` immediately:

```bash
git remote add cohi-website https://github.com/cohi-energy/cohi-website.git
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

After any emergency direct deploy, sync the fix back into `cohi/website` so the canonical source does not drift.

The `cohi-website` GitHub Action will:
1. Generate `config.js` from secrets
2. Deploy to GitHub Pages

Your site will be live at: `https://cohi.energy` (or your configured domain)

## File Structure

```
cohi/website/
├── index.html           # Main HTML file (all copy rendered server-side for SEO)
├── styles.css           # Stylesheet (built entirely on assets/brand/brand.css tokens)
├── script.js            # Scroll animations, form handling, CTA tracking, mobile nav
├── navigation.js        # Auth-aware app links (register vs /app)
├── reddit-pixel.js      # Reddit Pixel tracking code
├── posthog.js           # PostHog analytics tracking
├── config.template.js   # Config template with placeholders (committed)
├── config.js            # Local generated config with secrets (gitignored)
├── dev.sh               # Local development script
├── robots.txt           # Crawl policy + sitemap pointer
├── sitemap.xml          # Single-URL sitemap
├── assets/brand/        # GENERATED brand tokens + lockups (never edit by hand;
│                        #   edit brand/tokens.js and run scripts/sync-brand-assets.mjs)
├── assets/og-image.png  # Social preview card (1200x630)
├── .github/
│   └── workflows/
│       └── deploy.yml   # Workflow mirrored to cohi-website for GitHub Pages deploys
└── README.md            # This file
```

## Contact Form

The contact form posts to the app API, which stores the submission and emails it
to the team and the visitor. See [Contact Form](#contact-form) above for how it
works, or [docs/website-contact-form.md](https://github.com/cohi-energy/cohi/blob/main/docs/website-contact-form.md) for the
full reference.

Required fields:
- Name
- Email
- Phone number
- Address

Optional field:
- Message

There is also a hidden `reference_code` honeypot field (sent to the API as
`company_website`), named after nothing autofill fills. Real users never see or
tab to it, so any value means a bot, and the API drops those submissions.
