#!/usr/bin/env node
// Marketing-site analytics guards: runs posthog.js and script.js in a sandbox.
// Wrapper: scripts/tests/test-website-analytics.sh (ci-guards lane).

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const POSTHOG_SOURCE = read('website/posthog.js');
const SCRIPT_SOURCE = read('website/script.js');

function fakePostHog({ optedOut = false, userState } = {}) {
  const calls = [];
  const record = (name) => (...args) => {
    calls.push([name, ...args]);
  };
  // The app's id in the shared cookie when it identified this browser.
  const distinctId = userState === 'identified' ? 'cohi-user-1' : 'ph-visitor-1';
  return {
    __SV: 1, // the loader snippet skips injecting the real SDK
    calls,
    init: record('init'),
    capture: record('capture'),
    register: record('register'),
    setPersonProperties: record('setPersonProperties'),
    get_distinct_id: () => distinctId,
    get_session_id: () => 'ph-session-1',
    has_opted_out_capturing: () => optedOut,
    reset: record('reset'),
    unregister: record('unregister'),
  };
}

function sandbox({ hostname = 'cohi.energy', devEnabled, cookie = '', doNotTrack, windowDoNotTrack, globalPrivacyControl, optedOut = false, userState } = {}) {
  const posthog = fakePostHog({ optedOut, userState });
  const context = {
    URL,
    URLSearchParams,
    console: { ...console, warn() {} },
    POSTHOG_API_KEY: 'phc_test',
    POSTHOG_HOST: 'https://us.i.posthog.com',
    APP_BASE_URL: '',
    posthog,
    location: { hostname, origin: `https://${hostname}`, search: '?utm_source=newsletter' },
    navigator: { doNotTrack, globalPrivacyControl },
    document: {
      cookie,
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => null,
      addEventListener() {},
      documentElement: { clientHeight: 800 },
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {},
    setTimeout: () => 0,
  };
  if (devEnabled !== undefined) context.POSTHOG_DEV_ENABLED = devEnabled;
  if (windowDoNotTrack !== undefined) context.doNotTrack = windowDoNotTrack;
  context.window = context;
  vm.createContext(context);
  vm.runInContext(POSTHOG_SOURCE, context);
  return { context, posthog };
}

function initConfig(posthog) {
  const init = posthog.calls.find(([name]) => name === 'init');
  return init ? init[2] : null;
}

// Only the production site loads PostHog, unless a local build opts in; the
// free plan has one project, so anything else would land in production data.
{
  const production = initConfig(sandbox().posthog);
  assert.ok(production, 'cohi.energy initializes PostHog');
  assert.equal(production.capture_heatmaps, true, 'website heatmaps are on');
  assert.equal(production.autocapture, false, 'website autocapture stays off');
  assert.equal(production.disable_session_recording, true, 'the website is not recorded');
  assert.equal(production.respect_dnt, true);
  assert.ok(initConfig(sandbox({ hostname: 'www.cohi.energy' }).posthog), 'www initializes too');
  for (const hostname of ['localhost', '127.0.0.1', 'cohi-energy.github.io', 'preview.example.test']) {
    assert.equal(initConfig(sandbox({ hostname }).posthog), null, `${hostname} does not initialize PostHog`);
  }
  assert.ok(initConfig(sandbox({ hostname: 'localhost', devEnabled: true }).posthog), 'a local build can opt in');
}

// The browser's own Do Not Track or Global Privacy Control is the only switch
// (owner decision, 2026-10-12): a browser sending either loads no analytics at
// all, whatever the SDK version would do with it. It covers this browser only.
for (const [signal, loads] of [
  [{ globalPrivacyControl: true }, false],
  [{ doNotTrack: '1' }, false],
  [{ doNotTrack: 'yes' }, false],
  [{ windowDoNotTrack: '1' }, false],
  [{ globalPrivacyControl: false }, true],
  [{ doNotTrack: '0' }, true],
  [{ doNotTrack: null }, true],
]) {
  const config = initConfig(sandbox(signal).posthog);
  assert.equal(Boolean(config), loads, `${JSON.stringify(signal)} ${loads ? 'loads' : 'loads nothing'}`);
}

// One person per browser (owner decision, 2026-10-12): a browser the app
// identified keeps that person's id on the site, so the visit and an enquiry
// from it link to them. The server still checks the id and the address typed
// against the opt-outs it stored.
for (const [userState, distinctId] of [['identified', 'cohi-user-1'], ['anonymous', 'ph-visitor-1'], [undefined, 'ph-visitor-1']]) {
  const visitor = sandbox({ userState });
  initConfig(visitor.posthog).loaded(visitor.posthog);
  assert.equal(visitor.posthog.calls.some(([name]) => name === 'reset'), false, `a ${userState} visitor keeps their id`);
  assert.equal(visitor.context.getPostHogDistinctId(), distinctId);
  assert.equal(visitor.context.cohiAnalyticsAllowed(), true);
}

// A device marked internal through the app is tagged on the website too.
{
  const { posthog } = sandbox({ cookie: 'other=1; internal_analytics_device_v1=1' });
  const loaded = initConfig(posthog).loaded;
  loaded(posthog);
  // JSON round trip: objects built inside the sandbox have its own prototypes.
  const registered = (ph) => JSON.parse(JSON.stringify(ph.calls.filter(([name]) => name === 'register')));
  assert.deepEqual(registered(posthog), [
    ['register', { environment: 'production' }],
    ['register', { is_internal_traffic: true, internal_source: 'marked_device', internal_marker_version: 1 }],
  ]);
  const unmarked = sandbox();
  initConfig(unmarked.posthog).loaded(unmarked.posthog);
  assert.deepEqual(registered(unmarked.posthog), [['register', { environment: 'production' }]]);
  // Unmarked through the app since an earlier visit: the site's own storage
  // still holds the marker, so it is cleared once the cookie is gone.
  const unregistered = unmarked.posthog.calls.filter(([name]) => name === 'unregister').map(([, key]) => key);
  assert.deepEqual(unregistered, ['is_internal_traffic', 'internal_source', 'internal_marker_version']);
  const local = sandbox({ hostname: 'localhost', devEnabled: true });
  initConfig(local.posthog).loaded(local.posthog);
  assert.deepEqual(registered(local.posthog), [['register', { environment: 'development' }]]);
}

async function submitContact(options) {
  const { context, posthog } = sandbox(options);
  const calls = [];
  let onSubmit = null;
  const button = { disabled: false, innerHTML: 'Reach out' };
  const message = { textContent: '', className: '' };
  const form = {
    addEventListener(type, handler) {
      if (type === 'submit') onSubmit = handler;
    },
    querySelector: () => button,
    reset() {},
  };
  const values = {
    name: 'Lead Person',
    email: 'lead@example.com',
    // A 10-digit US number: the form checks every field before sending.
    phone: '415-555-0100',
    building_address: '1 Main St',
    message: 'Hello',
  };
  context.document.getElementById = (id) => (id === 'contact-form' ? form : id === 'form-message' ? message : null);
  context.FormData = class {
    get(key) {
      return values[key];
    }
  };
  context.fetch = async (url, init) => {
    calls.push([String(url), init]);
    const body = String(url).endsWith('/api/contact/submissions')
      ? { received: true, submission_id: 'sub-1' }
      : { lead_id: 'lead-1', lead_email_hash: 'hmac:lead' };
    return { ok: true, json: async () => body };
  };
  vm.runInContext(SCRIPT_SOURCE, context);
  assert.ok(onSubmit, 'script.js wires the contact form');
  await onSubmit.call(form, { preventDefault() {} });
  return { calls, posthog, message };
}

function submissionBody(calls) {
  const [, init] = calls.find(([url]) => url.endsWith('/api/contact/submissions'));
  return JSON.parse(init.body);
}

// The app records contact_form_submitted from the submission; the browser adds
// no event and never copies the lead's email and name onto a PostHog person.
// It links its PostHog ids to the lead only when analytics is allowed.
{
  const { calls, posthog, message } = await submitContact();
  assert.match(message.className, /success/);
  assert.deepEqual(
    calls.map(([url]) => url),
    [
      'https://app.cohi.energy/api/contact/submissions',
      'https://app.cohi.energy/api/analytics/lead-correlation',
    ],
  );
  assert.ok('posthog_distinct_id' in submissionBody(calls));
  assert.equal(posthog.calls.some(([name]) => name === 'capture' || name === 'setPersonProperties'), false);
}

// A browser that sends Do Not Track or GPC (or whose PostHog opted out) is not
// correlated or linked, but the enquiry itself still reaches the team.
for (const options of [
  { optedOut: true },
  { doNotTrack: '1' },
  { doNotTrack: 'yes' },
  { windowDoNotTrack: '1' },
  { globalPrivacyControl: true },
]) {
  const { calls, message } = await submitContact(options);
  assert.match(message.className, /success/);
  assert.deepEqual(calls.map(([url]) => url), ['https://app.cohi.energy/api/contact/submissions']);
  const body = submissionBody(calls);
  assert.equal('posthog_distinct_id' in body || 'posthog_session_id' in body, false);
}

// The Reddit pixel is gone everywhere.
assert.equal(existsSync(resolve(ROOT, 'website/reddit-pixel.js')), false);
for (const path of ['website/index.html', 'website/script.js', 'website/config.template.js', 'website/dev.sh', 'website/.github/workflows/deploy.yml']) {
  assert.equal(/reddit/i.test(read(path)), false, `${path} still mentions Reddit`);
}

console.log('website analytics: host gate, heatmaps, privacy signals, internal marker and contact analytics passed');
