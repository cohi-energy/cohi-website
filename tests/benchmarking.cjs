// Run with the existing frontend image via scripts/dc.sh; see website/README.md.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  try {
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(await fs.readFile(file));
  } catch { response.writeHead(404).end(); }
});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const submissions = [];
    let acceptSubmission = false;
    // Keep smoke checks independent of analytics and optional external services.
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/contact/submissions') {
        submissions.push(route.request().postDataJSON());
        return route.fulfill({
          status: acceptSubmission ? 200 : 422,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(acceptSubmission ? { received: true, submission_id: 'benchmarking-test' } : { detail: 'Rejected test request' }),
        });
      }
      if (url.pathname === '/api/analytics/lead-correlation') {
        return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{}' });
      }
      if (url.origin !== origin) return route.abort();
      if (url.pathname === '/config.js') return route.fulfill({ contentType: 'text/javascript', body: '' });
      return route.continue();
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin);
    assert.equal(await page.getByRole('textbox', { name: 'Address', exact: true }).count(), 1, 'The homepage keeps its address field');
    const headingStyle = locator => locator.evaluate(el => {
      const style = getComputedStyle(el);
      return Object.fromEntries(['fontFamily', 'fontWeight', 'fontSize', 'letterSpacing', 'lineHeight'].map(key => [key, style[key]]));
    });
    const homeHeroStyle = await headingStyle(page.locator('h1'));
    const homeSectionStyle = await headingStyle(page.locator('.process-title').first());
    const link = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Benchmarking', exact: true });
    assert.equal(await link.count(), 1, 'Homepage topbar must expose the benchmarking service');
    await link.click();
    assert.match(page.url(), /\/benchmarking\.html$/);
    assert.equal(
      await page.locator('.site-header .nav-cta').getAttribute('href'),
      '#benchmarking-contact',
      'Get Started stays on the benchmarking inquiry flow after navigation initializes',
    );
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('nav [aria-current="page"]').textContent(), 'Benchmarking');
    assert.equal(await page.getByRole('link', { name: /brochure/i }).count(), 0, 'The webpage has no brochure options');
    assert.deepEqual(await headingStyle(page.locator('h1')), homeHeroStyle, 'Hero typography follows the homepage');
    assert.deepEqual(await headingStyle(page.locator('#why-title')), homeSectionStyle, 'Section typography follows the homepage');
    const whyTitleBox = await page.locator('#why-title').boundingBox();
    const whyCopyBox = await page.locator('.bm-prose').boundingBox();
    assert.ok(Math.abs(whyTitleBox.y + whyTitleBox.height / 2 - whyCopyBox.y - whyCopyBox.height / 2) < 1, 'Explainer heading is vertically centered beside its text');
    async function checkFaqHeadingCenter() {
      const titleBox = await page.locator('#faq-title').boundingBox();
      const listBox = await page.locator('#benchmarking-faq .faq-list').boundingBox();
      assert.ok(Math.abs(titleBox.y + titleBox.height / 2 - listBox.y - listBox.height / 2) < 1, 'FAQ heading stays vertically centered beside its answers');
    }
    await checkFaqHeadingCenter();
    const firstQuestion = page.locator('#benchmarking-faq summary').first();
    await firstQuestion.click();
    await checkFaqHeadingCenter();
    await firstQuestion.click();
    const stepTops = await page.locator('.bm-workflow > li').evaluateAll(steps => steps.map(step => step.getBoundingClientRect().top));
    assert.equal(stepTops.length, 4);
    assert.ok(stepTops.every((top, index) => index === 0 || top > stepTops[index - 1]), 'Process cards form a readable vertical stack beside the heading');
    const inquiryLink = page.locator('.hero').getByRole('link', { name: 'Talk about your building', exact: true });
    assert.equal(await inquiryLink.getAttribute('href'), '#benchmarking-contact', 'Benchmarking inquiries stay on this page');
    await inquiryLink.click();
    assert.equal(new URL(page.url()).hash, '#benchmarking-contact');
    const inquiry = page.getByRole('form', { name: 'Let’s take care of the paperwork.' });
    assert.equal(await inquiry.count(), 1, 'Benchmarking has a dedicated, labelled form');
    assert.equal(await inquiry.locator('[name="building_address"]').count(), 0, 'Benchmarking does not ask for a single building address');
    const submit = inquiry.getByRole('button', { name: 'Request benchmarking help' });
    await submit.click();
    assert.equal(submissions.length, 0, 'Required fields prevent an empty inquiry');
    assert.equal(await inquiry.locator('#name').getAttribute('aria-invalid'), 'true');
    assert.ok(await inquiry.locator('#name').evaluate(el => el === document.activeElement));
    await inquiry.getByRole('textbox', { name: 'Name', exact: true }).fill('Benchmarking Preview');
    await inquiry.getByRole('textbox', { name: 'Email', exact: true }).fill('benchmarking@example.com');
    const portfolioDetails = '3 multifamily buildings and 1 commercial building. We received reporting notices.';
    await inquiry.getByRole('textbox', { name: 'Portfolio details', exact: true }).fill(portfolioDetails);
    await submit.click();
    await page.waitForFunction(() => document.getElementById('form-message').classList.contains('error'));
    assert.equal(submissions.length, 1);
    assert.equal(submissions[0].source, 'website_contact_form_benchmarking');
    assert.equal(submissions[0].page_url, `${origin}/benchmarking.html#benchmarking-contact`);
    assert.equal(submissions[0].building_address, '', 'The shared submission flow accepts an omitted address');
    assert.equal(submissions[0].message, portfolioDetails);
    assert.match(await inquiry.locator('#form-message').textContent(), /could not submit/);
    assert.equal(await inquiry.locator('#message').inputValue(), portfolioDetails, 'A failed request keeps portfolio details');
    assert.ok(await submit.isEnabled(), 'A failed request allows a retry');
    acceptSubmission = true;
    await submit.click();
    await page.waitForFunction(() => document.getElementById('form-message').classList.contains('success'));
    assert.equal(submissions.length, 2);
    assert.match(await inquiry.locator('#form-message').textContent(), /received your request/);
    assert.equal(await inquiry.locator('#message').inputValue(), '', 'An accepted inquiry clears the form');
    assert.ok(await submit.isEnabled());
    async function checkPrograms() {
      const sf = page.getByRole('region', { name: 'San Francisco EBO', exact: true });
      const state = page.getByRole('region', { name: 'California AB 802', exact: true });
      assert.equal(await sf.count(), 1, 'Identify the SF reporting program separately');
      assert.equal(await state.count(), 1, 'Identify the statewide reporting program separately');
      assert.match(await sf.textContent(), /May 1/);
      assert.match(await state.textContent(), /June 1/);
      assert.match(await state.textContent(), /more than 50,000/i, 'State threshold is strictly greater than 50,000 sq ft');
    }
    await checkPrograms();
    for (const width of [1440, 960, 800, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
      const toggle = page.getByRole('button', { name: 'Menu', exact: true });
      if (await toggle.isVisible()) {
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        assert.ok(await page.locator('nav [aria-current="page"]').isVisible());
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert.ok(await toggle.evaluate(el => el === document.activeElement));
      }
    }
    const localLinks = await page.locator('a[href]').evaluateAll(links => links.map(link => link.href));
    for (const href of new Set(localLinks.filter(href => href.startsWith(origin)))) {
      const result = await page.request.get(href);
      assert.equal(result.status(), 200, `Working local destination: ${href}`);
    }
    assert.ok(localLinks.some(href => href.startsWith('mailto:contact@cohi.energy')), 'Benchmarking inquiry has a contact destination');
    await page.goto(`${origin}/benchmarking-brochure.html`);
    assert.equal(await page.locator('.brochure-page').count(), 1, 'Brochure contains one print page');
    assert.equal(await page.locator('.brochure-contact a').getAttribute('href'), 'https://cohi.energy/benchmarking.html#benchmarking-contact', 'Brochure inquiries reach the dedicated form');
    const brochureHeading = await headingStyle(page.locator('h1'));
    assert.equal(brochureHeading.fontFamily, homeHeroStyle.fontFamily, 'Brochure uses the website heading family');
    assert.equal(brochureHeading.fontWeight, homeHeroStyle.fontWeight, 'Brochure uses the website heading weight');
    await checkPrograms();
    const pdfHref = await page.getByRole('link', { name: 'Download PDF' }).getAttribute('href');
    const pdf = await page.request.get(new URL(pdfHref, page.url()).href);
    assert.equal(pdf.status(), 200, 'Brochure PDF is downloadable');
    assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-', 'Download is a PDF');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Brochure fits ${width}px`);
    }
    await page.emulateMedia({ media: 'print' });
    const printHeight = await page.locator('.brochure-page').evaluate(el => el.getBoundingClientRect().height);
    assert.ok(printHeight <= 1056, `Brochure must fit a single Letter page, got ${printHeight}px`);
    assert.deepEqual(errors, [], 'No uncaught browser errors');
    console.log('PASS: homepage typography parity, benchmarking form validation/delivery/retry, navigation, responsive menu, destinations, and one-page brochure');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
