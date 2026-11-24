# Cohi Landing Page

The marketing site for Cohi's bill-optimization app: free rate-plan checking and switching for homes and small businesses, and portfolio-wide energy-spend screening for multifamily owners and operators. Primary conversion is app signup (`app.cohi.energy/register`); secondary is the portfolio-review contact form.

## San Francisco EBO and California AB 802 benchmarking

`benchmarking.html` is the dedicated service page linked from the topbar.
`benchmarking-brochure.html` and `benchmarking-brochure.css` are the editable
source for the one-page, US Letter customer brochure at
`assets/cohi-benchmarking.pdf`. Both direct inquiries to the dedicated form at
`benchmarking.html#benchmarking-contact`. It reuses the website's validated
submission flow with `website_contact_form_benchmarking` as its source, so the
team can distinguish it from homepage inquiries. The benchmarking page's header
CTA also leads to this form and must not use `data-account-entry-link`, which
would redirect it to the billing app's account flow. This is a customer-facing marketing brochure, not an internal
report packet.

The webpage's experience section uses plain-text names based on the user's
confirmation that Cohi has worked on buildings for these organizations. It does
not claim endorsements, partnerships or work across their entire portfolios.
The brochure does not contain company references. Permission to publish these
references has not been verified.

Name checks: [FirstService Residential](https://www.fsresidential.com/california/)
(the supplied FSR), [Action Property Management](https://www.actionlife.com/),
[Associa](https://www.associaonline.com/),
[Structure Properties](https://structureproperties.com/) and
[Powerstone Property Management](https://www.powerstonepm.com/).
The user identified [GLIDE](https://www.glide.org/programs/welcome-center/) and
confirmed that Cohi's work was on properties GLIDE manages. Use its official
uppercase spelling. Anvil Property Management remains as supplied by the user;
its exact entity has not been confirmed. No company links or logos are used.
Public company sites verify spelling, not Cohi's work or reference permissions.

Content sources, checked November 22, 2026:

- [SF Environment program](https://www.sfenvironment.org/existing-buildings-energy-performance-ordinance)
  and [benchmarking FAQ](https://www.sfenvironment.org/benchmarking-faq): generally
  10,000+ sq ft nonresidential and 50,000+ sq ft residential, including qualifying
  condominiums and mixed-use properties; May 1 annual reporting for the previous
  calendar year. Use current program guidance, not older April 1 material.
  Coverage and exemptions require property-specific review.
- [CEC local programs](https://www.energy.ca.gov/programs-and-topics/programs/building-energy-benchmarking-program/exempted-local-benchmarking):
  SF is a recognized local reporting program. A city-accepted benchmark fulfills
  applicable AB 802 reporting; a CEC-only submission does not satisfy SF.
  Other exempt local programs exist, so not every building outside SF files
  directly with the CEC.
- [CEC program FAQ](https://www.energy.ca.gov/programs-and-topics/programs/building-energy-benchmarking-program/building-energy-benchmarking):
  state reporting is due June 1 for the previous calendar year. It covers
  buildings strictly **more than 50,000 sq ft** with no residential utility
  accounts or at least 17 residential units, subject to exemptions. The FAQ
  counts units even with master metering; the regulation expresses the condition
  in terms of active residential utility accounts. Statewide condominiums are
  excluded. Keep these rules separate from SF's local coverage and May 1 date.
  Missing utility data does not always prevent reporting: the CEC describes
  limited routes to report without energy data when access cannot be obtained,
  and extensions when utilities have not provided data in time. The webpage's
  missing-data FAQ therefore promises review of the applicable reporting options
  rather than making complete data an absolute prerequisite.
- [EPA benchmarking metrics](https://www.energystar.gov/buildings/benchmark/understand-metrics):
  benchmarking and eligible-property scores differ from voluntary certification.
  The service does not claim certification or fulfillment of a separate audit.

From a named linked worktree, use the existing Docker image without installing
dependencies. Run `./scripts/dc.sh ensure` first. The browser check covers the
navigation journey, mobile disclosure, local links, distinct program rules and print layout.
It is a manual check: no test lane runs it. The gated checks are the static
ones in `scripts/tests/test-website-contact-form.mjs`: every contact form
declares its own `data-contact-source`, and the pages agree on the
`styles.css` and `script.js` cache versions and on the primary nav.

```bash
./scripts/dc.sh run --rm --no-deps \
  -v "$PWD/website:/app/website:ro" \
  frontend node /app/website/tests/benchmarking.cjs
```

After changing brochure text or styles, regenerate the PDF using the vendored
brand fonts, then visually inspect the exported PDF before committing it:

```bash
./scripts/dc.sh run --rm --no-deps \
  -v "$PWD/website:/app/website" \
  -v "$PWD/brand/fonts:/app/brand/fonts:ro" \
  frontend node /app/website/tests/render-brochure.cjs
```

The exporter refuses a layout taller than one Letter page and requires all
three brand fonts to load. The PDF contains selectable text and live links.
It is a web/email/office-print asset, without commercial press bleed or CMYK
conversion. Stop the owned stack with `./scripts/dc.sh stop` when finished.

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
- `POSTHOG_API_KEY`: Your PostHog API key (starts with `phc_`)
- `POSTHOG_HOST`: `https://us.i.posthog.com`
- `GOOGLE_MAPS_API_KEY`: optional, the contact form's address suggestions (the
  `cohi-website` browser key allows `http://localhost:8001`; left as the
  placeholder, the address field is plain text)

**Note:** `config.js` is gitignored and will not be committed to the repository.

#### For Production (GitHub Pages):

Secrets are injected at build time in the standalone `cohi-website` repository after the subtree sync completes. See [Deploying to GitHub Pages](#deploying-to-github-pages) below.

### Contact Form

The contact form posts to the app's own API, which stores the submission and
emails it to us. `navigation.js` resolves the app origin at runtime
(`https://app.cohi.energy` in production); its only setting is the optional
`GOOGLE_MAPS_API_KEY` for address suggestions.

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

### PostHog Analytics

The site includes PostHog analytics for user tracking with cross-subdomain support between cohi.energy and app.cohi.energy.

#### Features:
- **Cross-subdomain identity**: PostHog's id cookie is shared on `.cohi.energy`, so a browser the app identified visits the site as that person (one person per browser), and the app links an anonymous visitor's website history to their person when they sign in
- **Automatic pageviews**: Page visits are captured automatically
- **Privacy-safe explicit events**: Autocapture and session recording are disabled; heatmaps (clicks, pointer movement and scroll depth) and CTA clicks are on; the contact form's event is recorded by the app server
- **Privacy signals**: a browser that sends Do Not Track or Global Privacy Control loads no PostHog at all, as in the app; it covers that browser only
- **Lead/account correlation**: When analytics is allowed, a contact form submission carries the visitor's PostHog ids and then calls the app's lead-correlation endpoint, which returns `lead_id` and an HMAC email hash; the app server, not the browser, sets the email and name on the PostHog person. Correlation must never block the submission.

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
- `cohiAnalyticsAllowed()` - False when PostHog is not running on this host (Do Not Track or GPC among the reasons), or the visitor opted out

PostHog loads only on `cohi.energy` and `www.cohi.energy`; set `POSTHOG_DEV_ENABLED = true` in a local `config.js` to test locally (events land in the production project). The contact form's `contact_form_submitted` event is recorded by the app server. Events and privacy rules: `docs/analytics/` in the main repo.

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

If the subtree sync ever fails, first verify that the `website-sync` environment in `cohi` still holds `SUBREPO_DEPLOY_KEY`, that its public half is still a deploy key with write access on `cohi-energy/cohi-website`, and that deploy keys may bypass the ruleset protecting `master`. A host key error means GitHub rotated its SSH keys: update the keys pinned in the workflow, as the root README's "Website Subtree Sync (GitHub Pages)" setup describes.

### Initial Setup (One-time)

1. **Add GitHub Secrets**
   - Go to the `cohi-website` repository on GitHub
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Add the following secrets:
     - `POSTHOG_API_KEY` - Your PostHog API key (starts with `phc_`)
     - `POSTHOG_HOST` - PostHog host URL (`https://us.i.posthog.com`)

2. **Enable GitHub Pages with Actions**
   - In `cohi-website`, go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

3. **Add the subtree sync deploy key**
   - Follow the root README's "Website Subtree Sync (GitHub Pages)" setup: a deploy key with write access on `cohi-website`, its private half stored as `SUBREPO_DEPLOY_KEY` in the `website-sync` environment of `cohi`

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

Required fields (marked with a red asterisk):
- Name
- Email
- Message

Optional fields:
- Phone number (a US number when given)
- Address (with Google address suggestions; free text is fine too)

Each field is checked when the visitor leaves it and on submit, with its own
message under it. The rules are in
[docs/website-contact-form.md](https://github.com/cohi-energy/cohi/blob/main/docs/website-contact-form.md#fields).

There is also a hidden `reference_code` honeypot field (sent to the API as
`company_website`), named after nothing autofill fills. Real users never see or
tab to it, so any value means a bot, and the API drops those submissions.
