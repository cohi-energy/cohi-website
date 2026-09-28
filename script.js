// Gate each animated showcase on viewport visibility.
// Cards marked with [data-scroll-animate] get the `is-in` class added
// when they enter the viewport and removed when they leave. The class
// toggle restarts every animation inside the card from frame zero, so
// scrolling away and back replays the showcase from the beginning.

(function setupScrollAnimate() {
    const cards = document.querySelectorAll('[data-scroll-animate]');
    if (!cards.length) return;

    // If the browser can't observe intersections, leave the cards in
    // their animated state so users still get a non-broken experience.
    if (typeof IntersectionObserver === 'undefined') {
        cards.forEach((c) => c.classList.add('is-in'));
        return;
    }

    // Reduced-motion users don't want re-triggers; just leave the
    // CSS resolved-state styling alone.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cards.forEach((c) => c.classList.add('is-in'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    // If the class is already present (re-entering quickly),
                    // briefly remove it so the animations restart from 0.
                    if (el.classList.contains('is-in')) {
                        el.classList.remove('is-in');
                        // Force a reflow so the next add is treated as a
                        // fresh class change, not a no-op.
                        void el.offsetWidth;
                    }
                    el.classList.add('is-in');
                } else {
                    el.classList.remove('is-in');
                }
            });
        },
        { threshold: 0.3 },
    );

    cards.forEach((c) => observer.observe(c));
})();

// Lock the chart line-tip dot to the live polyline value at its
// horizontal position, with zero perceptible lag.
//
// A per-frame JS update (setting `style.transform`) lags the CSS
// `.mon-track` animation by ~1 frame because the JS-set transform
// goes through the style commit pipeline while the track's
// translate runs on the compositor. Even when the math is exact,
// the visible result is offset by a frame.
//
// Fix: drive the dot with the Web Animations API instead. Element
// .animate() puts the dot on the same compositor pipeline as the
// track. We then explicitly tie the two animations' `startTime`s
// so their `currentTime`s always differ by exactly the phase
// shift the dot's horizontal position implies — same frame, same
// engine, no drift.
(function setupMonLineDotDrive() {
    const cards = document.querySelectorAll('.mon-card');
    if (!cards.length) return;

    // Honor reduced-motion: skip building the dot animation
    // entirely; the dot rests at its CSS-default top.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Polyline points exactly as drawn in the chart SVG. Restored
    // to the original uniform 50-px zigzag, with each y-deviation
    // from the center (50) amplified by 1.5× and clamped to
    // [10, 90] — same rhythm and peak/valley positions as before,
    // but every slope between adjacent points is steeper so each
    // shift reads as a sharp swing. The dot animation samples
    // these same points so the dot rides every peak.
    const points = [
        [   0, 58], [  50, 83], [ 100, 44], [ 150, 90], [ 200, 50], [ 250, 90],
        [ 300, 35], [ 350, 77], [ 400, 62], [ 450, 23], [ 500, 71], [ 550, 10],
        [ 600, 53], [ 650, 32], [ 700, 77], [ 750, 17], [ 800, 62], [ 850, 26],
        [ 900, 56], [ 950, 10], [1000, 41], [1050, 20], [1100, 65], [1150, 10],
        [1200, 50], [1250, 29], [1300, 68], [1350, 17], [1400, 56], [1450, 35],
        [1500, 10], [1550, 47], [1600, 23], [1650, 62], [1700, 10], [1750, 41],
        [1800, 26], [1850, 68], [1900, 14], [1950, 50], [2000, 58],
    ];

    const SCROLL_DURATION_MS = 22000;
    const CONTENT_WIDTH = 2000;
    const DOT_LEFT_FRAC = 0.94;
    const CHART_TOP_PCT = 12;
    const CHART_HEIGHT_PCT = 36;
    const DOT_HALF_PX = 2.5;

    cards.forEach((card) => {
        const dot = card.querySelector('.mon-line-dot');
        const viewport = card.querySelector('.mon-viewport');
        const track = card.querySelector('.mon-track');
        if (!dot || !viewport || !track) return;

        let dotAnim = null;

        function cancelDot() {
            if (dotAnim) {
                dotAnim.cancel();
                dotAnim = null;
            }
        }

        function rebuild() {
            cancelDot();

            const vpWidth = viewport.clientWidth;
            const vpHeight = viewport.clientHeight;
            if (!vpWidth || !vpHeight) return;

            const trackAnims = track.getAnimations();
            if (trackAnims.length === 0) return;
            const trackAnim = trackAnims[0];
            // Track may exist but not have a startTime yet (it gets
            // one once the animation actually plays). If null, retry
            // next frame.
            if (trackAnim.startTime == null) {
                requestAnimationFrame(rebuild);
                return;
            }

            // The dot sits at viewport-x = DOT_LEFT_FRAC * V. At
            // track currentTime = t, the chart-x under the dot is
            //   chartX = DOT_LEFT_FRAC * V + (t / dur) * W
            // The dot's keyframes step through polyline values
            // chartX = 0 → W as offset 0 → 1, i.e. they reach
            // chart-x = X at currentTime = (X / W) * dur. So the
            // dot's currentTime should always lead the track's by
            //   phase = (DOT_LEFT_FRAC * V / W) * dur
            // Two animations on the same timeline relate via their
            // startTimes: dot.startTime = track.startTime - phase.
            const phaseShiftMs =
                (DOT_LEFT_FRAC * vpWidth / CONTENT_WIDTH) * SCROLL_DURATION_MS;

            const keyframes = points.map(([x, y]) => {
                const yPct = CHART_TOP_PCT + (y / 100) * CHART_HEIGHT_PCT;
                const yPx = (vpHeight * yPct) / 100 - DOT_HALF_PX;
                return {
                    transform: `translate3d(-50%, ${yPx.toFixed(2)}px, 0)`,
                    offset: x / CONTENT_WIDTH,
                };
            });

            dotAnim = dot.animate(keyframes, {
                duration: SCROLL_DURATION_MS,
                iterations: Infinity,
                easing: 'linear',
            });
            dotAnim.startTime = trackAnim.startTime - phaseShiftMs;
        }

        // Whenever `is-in` flips on, the track's CSS animation is
        // (re)created on the next frame. Wait one rAF so the new
        // animation has a startTime, then rebuild the dot animation
        // tied to it. Whenever `is-in` flips off, cancel the dot.
        const classObs = new MutationObserver(() => {
            if (card.classList.contains('is-in')) {
                requestAnimationFrame(rebuild);
            } else {
                cancelDot();
            }
        });
        classObs.observe(card, { attributes: true, attributeFilter: ['class'] });

        // Viewport size changes the phase shift (it depends on V)
        // and the absolute y in px. Rebuild on resize.
        const sizeObs = new ResizeObserver(() => {
            if (card.classList.contains('is-in')) rebuild();
        });
        sizeObs.observe(viewport);

        if (card.classList.contains('is-in')) {
            requestAnimationFrame(rebuild);
        }
    });
})();

// Scroll-driven side reveal for the four narrative process
// steps (bill-story, plan-compare, admin-list, monitor).
// Each step gets a `--reveal-progress` CSS variable that
// moves from 0 → 1 as the step's top crosses from the
// viewport bottom up to the viewport's 50 % line. The CSS
// uses that variable to translate each column in from its
// respective page margin and lift opacity from 0.18 to 1.
//
// Honours prefers-reduced-motion by leaving --reveal-progress
// at its CSS-default (1) and skipping the loop.
(function setupRevealSides() {
    const steps = document.querySelectorAll('.reveal-sides');
    if (!steps.length) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    function revealProgressForTop(top, startY, range) {
        let p = (startY - top) / range;
        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        return p;
    }

    const mobileRevealQuery = window.matchMedia
        ? window.matchMedia('(max-width: 767px)')
        : { matches: false };

    function update() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // The reveal band: starts once the content is well inside the
        // viewport (not the instant it peeks in) and ends when the
        // grid TOP is 32% down the screen. With the content blocks
        // measuring roughly 45% of a viewport tall, that lands the
        // block's perceived center at 40-50% of its journey through
        // the viewport when the motion settles, matching the CSS
        // scroll-driven-animation convention (entry/cover ~40%).
        // Raise START_RATIO to begin earlier; raise END_RATIO to
        // finish sooner (higher on the screen means earlier).
        const START_RATIO = 0.88;
        const END_RATIO   = 0.32;
        const startY = vh * START_RATIO;
        const endY   = vh * END_RATIO;
        const range  = startY - endY;
        const isMobileReveal = mobileRevealQuery.matches;
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            // Anchor on the content grid, not the step shell: the steps
            // are viewport-tall with centered content, so the shell's top
            // crosses the band while the content is still below the fold.
            // Both columns share the grid anchor so the two sides travel
            // in lockstep; on stacked mobile each column uses its own
            // position instead, since they enter one after the other.
            const grid = step.querySelector('.process-grid') || step;
            const anchorTop = grid.getBoundingClientRect().top;
            const p = revealProgressForTop(anchorTop, startY, range);
            step.style.setProperty('--reveal-progress', p.toFixed(3));

            const targets = step.querySelectorAll('.process-text, .process-scene-col');
            targets.forEach((target) => {
                const targetTop = isMobileReveal ? target.getBoundingClientRect().top : anchorTop;
                const targetProgress = revealProgressForTop(targetTop, startY, range);
                target.style.setProperty('--reveal-progress', targetProgress.toFixed(3));
            });
        }
    }

    let rafId = 0;
    function schedule() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            update();
        });
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // Initial paint — set the right state before the first scroll.
    update();
})();

// =============================================================
// Contact form. POSTs the full submission to the app's own
// contact endpoint, which persists it and emails both us and the
// visitor. Success is shown as soon as that POST is accepted.
//
// ORDER MATTERS, in two ways that are easy to undo by accident:
//
// 1. The submission runs FIRST and lead correlation only after it
//    is accepted. Correlating first left an orphan lead record and
//    PostHog person properties behind for submissions the API
//    refused, which happens deterministically on requests 6 to 10
//    in a minute, since correlation allows 10/min and the contact
//    endpoint 5/min. The lead is not lost by waiting: the submission
//    row stores email_hash and the PostHog ids itself. A correlation
//    cut off by an early page close costs only the lead_id person
//    property: the identity backfill builds the pre-signup alias from
//    the submission row too.
// 2. Correlation is NOT awaited before showing success. It is best
//    effort, and awaiting it let a stalled analytics request hold
//    the button disabled for a submission that was already stored
//    with its emails scheduled, so visitors retried and created
//    duplicates.
//
// This replaced a Google Apps Script Web App that appended a row
// to a Sheet. That path sent no mail, dropped the phone number,
// and was posted to with mode:'no-cors', so its response was
// opaque and a failed write still showed the visitor a success
// message. Do not reintroduce a no-cors sink here.
//
// External symbols (trackPostHogEvent, setLeadPostHogProperties,
// getPostHogDistinctId/SessionId, trackRedditConversion,
// window.cohiNavigation.resolveAppOrigin, APP_BASE_URL) come from
// posthog.js + reddit-pixel.js + navigation.js.
// =============================================================

const contactForm = document.getElementById('contact-form');

// The app origin for the contact submission and the analytics calls. The
// submission is the one call that records a lead, so the fallback (used only if
// navigation.js did not load) gives navigation.js's resolveAppOrigin answer: a
// local page goes to the Vite dev server (its paired port, else 5173) and every
// other host, the app's own included, goes to the app.
// Posting to the page's own static server would fail and lose the lead.
// Keep LOCAL_APP_PORT_PAIRS in step with navigation.js's LOCAL_PORT_PAIRS.
const LOCAL_APP_PORT_PAIRS = { '8000': '5173', '5173': '8000', '5174': '8001' };

function resolveAppOrigin() {
    if (window.cohiNavigation && typeof window.cohiNavigation.resolveAppOrigin === 'function') {
        return window.cohiNavigation.resolveAppOrigin();
    }
    if (typeof APP_BASE_URL !== 'undefined' && APP_BASE_URL) {
        // An unusable value (unparseable, or not http or https) falls through
        // to the rules below rather than failing the submission. navigation.js
        // falls through for the unparseable ones too.
        try {
            const configured = new URL(APP_BASE_URL, window.location.origin);
            if (configured.protocol === 'http:' || configured.protocol === 'https:') {
                return configured.origin;
            }
        } catch {
            // Fall through.
        }
    }
    const { hostname, protocol, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:${LOCAL_APP_PORT_PAIRS[port] || '5173'}`;
    }
    return 'https://app.cohi.energy';
}

function currentUtmProperties() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
        const value = params.get(key);
        if (value) {
            utm[key] = value;
        }
    });
    return utm;
}

// Bounded so a request that never settles cannot leak a pending promise. The
// caller does not await this, so the timeout is belt and braces rather than the
// thing protecting the submit button.
const LEAD_CORRELATION_TIMEOUT_MS = 8000;

async function createLeadCorrelation(email) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
        ? setTimeout(() => controller.abort(), LEAD_CORRELATION_TIMEOUT_MS)
        : null;
    try {
        const appOrigin = resolveAppOrigin();
        const response = await fetch(`${appOrigin}/api/analytics/lead-correlation`, {
            method: 'POST',
            mode: 'cors',
            signal: controller ? controller.signal : undefined,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                posthog_distinct_id: typeof getPostHogDistinctId === 'function' ? getPostHogDistinctId() : null,
                posthog_session_id: typeof getPostHogSessionId === 'function' ? getPostHogSessionId() : null,
                source: 'website_contact_form_multifamily',
                utm: currentUtmProperties()
            })
        });
        if (!response.ok) {
            return null;
        }
        // Awaited here, inside the try and before the timer is cleared, so a
        // malformed or stalled body is caught and bounded like the request.
        return await response.json();
    } catch {
        return null;
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
}

// The API stores page_url and referrer truncated to 500 characters and rejects
// anything over 4000. These come straight from the browser and can be far
// longer (long ad-tracking query strings), so trim here to the stored length
// rather than let optional attribution metadata cost us the whole lead.
function trimAttributionUrl(value) {
    return (value || '').toString().slice(0, 500);
}

// Bounded because this one IS awaited and it holds the submit button disabled.
// Without a deadline, a connection the API accepts but never answers leaves the
// button spinning forever and the visitor never sees the email fallback, which
// defeats the honest-failure property this whole endpoint exists for. Generous
// relative to the work involved: the response is sent before the two emails are
// attempted, so the request itself is only a database insert.
const CONTACT_SUBMISSION_TIMEOUT_MS = 15000;

// The authoritative submission. Unlike the lead-correlation call above, this is
// NOT best effort: it is the only thing that records the lead and notifies us,
// so a failure must reach the visitor rather than being swallowed.
async function submitContactForm(submission) {
    const appOrigin = resolveAppOrigin();
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller
        ? setTimeout(() => controller.abort(), CONTACT_SUBMISSION_TIMEOUT_MS)
        : null;
    try {
        let response;
        try {
            response = await fetch(`${appOrigin}/api/contact/submissions`, {
                method: 'POST',
                mode: 'cors',
                signal: controller ? controller.signal : undefined,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });
        } catch (error) {
            // No response at all: a timeout, or a connection that dropped,
            // possibly after the body was sent and the row committed. Either
            // way we cannot say whether it was recorded.
            error.unconfirmed = true;
            throw error;
        }
        if (!response.ok) {
            const failure = new Error(`Contact submission failed with status ${response.status}`);
            // A server error cannot prove the row was not stored: a 500 can
            // follow the commit, and a proxy's 502/503/504 looks the same as the
            // API's own. Only a 4xx is a definite refusal before anything is
            // stored.
            failure.unconfirmed = response.status >= 500;
            throw failure;
        }
        // A 2xx alone proves nothing: a captive portal, a proxy's error page or
        // a redirect to some HTML page all answer 200 without the API ever
        // seeing the lead. The API always answers {received: true}, so only
        // that is a success; anything else is unconfirmed, which asks the
        // visitor to email us rather than thanking them for a lead we may not
        // hold.
        let result = null;
        try {
            result = await response.json();
        } catch {
            result = null;
        }
        if (!result || result.received !== true) {
            const unconfirmed = new Error('Contact submission response was not the API acceptance');
            unconfirmed.unconfirmed = true;
            throw unconfirmed;
        }
        return result;
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
}

// Run one analytics call, logging rather than raising: these are globals from
// other files, and one failing must not cost the others or the confirmation.
function runAnalytics(label, call) {
    try {
        call();
    } catch (error) {
        console.error(`Contact analytics error (${label}):`, error);
    }
}

// Everything a recorded lead reports to analytics, after the visitor has been
// told it is received. Nothing here may take that confirmation back.
function recordContactConversion(email, name) {
    runAnalytics('reddit', () => {
        if (typeof trackRedditConversion === 'function') {
            trackRedditConversion('Lead');
        }
    });

    // The conversion event fires now, with the confirmation: a visitor who
    // leaves while correlation is still running would otherwise take it with
    // them. The server-side event already carries the email hash that joins it
    // to the lead.
    runAnalytics('posthog event', () => {
        if (typeof trackPostHogEvent === 'function') {
            trackPostHogEvent('contact_form_submitted', {
                form_type: 'multifamily_consultation'
            });
        }
    });

    // Deliberately not awaited. Correlation is best effort and its result only
    // decorates the PostHog person properties. It settles later, outside any
    // try above, so its callback guards itself and a rejection is caught here.
    runAnalytics('correlation', () => {
        createLeadCorrelation(email).then((leadCorrelation) => {
            runAnalytics('person properties', () => {
                if (typeof setLeadPostHogProperties === 'function') {
                    setLeadPostHogProperties({
                        email,
                        name,
                        lead_id: leadCorrelation ? leadCorrelation.lead_id : undefined,
                        lead_email_hash: leadCorrelation ? leadCorrelation.lead_email_hash : undefined,
                        lead_source: 'website_contact_form_multifamily',
                        ...currentUtmProperties()
                    });
                }
            });
        }).catch((error) => {
            console.error('Contact analytics error (correlation):', error);
        });
    });
}

// --- field rules ------------------------------------------------------------
//
// Name, email and message are required; phone and address are optional (owner
// decision, 2026-09-27). A phone, when given, must have the shape of a US
// number. The API applies the same rules (packages/api/src/routers/contact.py);
// checking here only saves the visitor a round trip and says which field to fix.
const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Characters the API refuses in an address (a display-name form such as
// a<victim@example.com> could reach another inbox), and control characters.
const EMAIL_REFUSED_CHARACTERS = /[<>,;:"()\\[\]\x00-\x1f\x7f]/;
// Pasted formatting a phone may carry, the same set the API folds: invisible
// marks (dropped: soft hyphen, zero-width space and joiners, direction marks,
// word joiner, byte-order mark), typographic dashes (read as '-') and any
// space (read as ' ').
const PHONE_MARKS = /[\u00ad\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g;
const PHONE_DASHES = /[\u2010-\u2015\u2212]/g;
const PHONE_SPACES = /[\s\u0085\u001c-\u001f]/g;
// Once folded: ASCII digits, spaces and the usual separators, as in the API.
const US_PHONE_CHARACTERS = /^[0-9 ().+-]+$/;

function foldPhoneFormatting(value) {
    return value.replace(PHONE_MARKS, '').replace(PHONE_DASHES, '-').replace(PHONE_SPACES, ' ');
}
// Ten digits, optionally led by the country code 1; area code and exchange
// start 2-9 and are not an N11 service code (411, 911, ...).
const US_PHONE_DIGITS = /^1?([2-9]\d{2})([2-9]\d{2})\d{4}$/;

// With the browser's own email check off (novalidate), empty or hyphen-edged
// domain labels (two dots in a row, say) are caught here. The page is stricter
// than the API on this, never looser, so it cannot cause a 400.
function hasValidDomainLabels(value) {
    const domain = value.slice(value.lastIndexOf('@') + 1);
    return domain.split('.').every((label) => label !== '' && !label.startsWith('-') && !label.endsWith('-'));
}

function isUsPhoneShape(value) {
    const folded = foldPhoneFormatting(value);
    if (!US_PHONE_CHARACTERS.test(folded)) {
        return false;
    }
    const match = folded.replace(/[^0-9]/g, '').match(US_PHONE_DIGITS);
    return Boolean(match) && match[1].slice(1) !== '11' && match[2].slice(1) !== '11';
}

// In form order, so the first invalid field is the first one on the page.
const CONTACT_FIELD_RULES = [
    { id: 'name', message: 'Enter your name.', isValid: (value) => value.length > 0 },
    { id: 'email', message: 'Enter a valid email address.', isValid: (value) => CONTACT_EMAIL_PATTERN.test(value) && !EMAIL_REFUSED_CHARACTERS.test(value) && hasValidDomainLabels(value) },
    { id: 'phone', message: 'Enter a 10-digit US phone number.', isValid: (value) => value === '' || isUsPhoneShape(value) },
    { id: 'message', message: 'Add a short message.', isValid: (value) => value.length > 0 }
];

function showFieldError(id, text) {
    const input = document.getElementById(id);
    const error = document.getElementById(`${id}-error`);
    if (input) {
        if (text) {
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.removeAttribute('aria-invalid');
        }
    }
    if (error) {
        error.textContent = text || '';
        error.hidden = !text;
    }
}

// Whitespace at either end as the API counts it: JavaScript's own plus U+0085
// and U+001C-U+001F, which Python strips too (the API also strips the
// byte-order mark, already whitespace here).
// A loop, not a regex: a pattern anchored only at its end retries an inner
// run of spaces from every start, which is quadratic on a 20,000-character
// message and would stall the page.
const BLANK_CHARACTER = /[\s\u0085\u001c-\u001f]/;

function trimBlank(value) {
    let start = 0;
    let end = value.length;
    while (start < end && BLANK_CHARACTER.test(value[start])) {
        start += 1;
    }
    while (end > start && BLANK_CHARACTER.test(value[end - 1])) {
        end -= 1;
    }
    return value.slice(start, end);
}

// Checks one field, shows or clears its message, and returns whether it passed.
function checkContactField(rule, value) {
    const valid = rule.isValid(trimBlank(value));
    showFieldError(rule.id, valid ? '' : rule.message);
    return valid;
}

// Fields the visitor has typed in since the page loaded or the form reset.
const touchedContactFields = new Set();

function setupFieldChecks() {
    CONTACT_FIELD_RULES.forEach((rule) => {
        const input = document.getElementById(rule.id);
        if (!input) {
            return;
        }
        // Checked when the visitor leaves a field they have typed in, not
        // while tabbing through untouched ones; a field already flagged
        // clears as soon as it is fixed.
        input.addEventListener('blur', () => {
            if (touchedContactFields.has(rule.id)) {
                checkContactField(rule, input.value || '');
            }
        });
        input.addEventListener('input', () => {
            touchedContactFields.add(rule.id);
            if (input.getAttribute('aria-invalid') === 'true') {
                checkContactField(rule, input.value || '');
            }
        });
    });
}

// After a successful submit resets the form: every field is untouched again
// and nothing is flagged.
function resetFieldChecks() {
    touchedContactFields.clear();
    CONTACT_FIELD_RULES.forEach((rule) => showFieldError(rule.id, ''));
}

// --- address lookup -----------------------------------------------------------
//
// Google Places (API New, project cohi-website) suggests US addresses as the
// visitor types. Picking one fills the field with Google's formatted address;
// typing without picking is fine too, and either way the field is sent as it
// stands, with nothing recording which. Without a key, or if Google fails or
// its daily quota is spent, the field is plain text.
//
// Programmatic suggestions rather than Google's drop-in widget: the widget
// replaces the input with its own, which would lose free typing and the form's
// own field. Billing: one session per address entry, closed by a single
// formattedAddress lookup when a suggestion is picked. See
// docs/website-contact-form.md, "Address suggestions".
const MAPS_KEY_PLACEHOLDER = '__GOOGLE_MAPS_API_KEY__';
const MAPS_READY_CALLBACK = '__cohiAddressLookupReady';
const ADDRESS_LOOKUP_MIN_CHARACTERS = 3;
const ADDRESS_LOOKUP_DELAY_MS = 250;
const ADDRESS_SUGGESTION_LIMIT = 5;
// Street addresses and buildings only, not businesses, cities or landmarks.
const ADDRESS_PRIMARY_TYPES = ['street_address', 'premise', 'subpremise'];
// Set by setupAddressLookup when suggestions are active; the submit handler
// closes an open list with it.
let closeAddressSuggestions = () => {};

function googleMapsApiKey() {
    if (typeof GOOGLE_MAPS_API_KEY !== 'string') {
        return '';
    }
    const key = GOOGLE_MAPS_API_KEY.trim();
    return key && key !== MAPS_KEY_PLACEHOLDER ? key : '';
}

function setupAddressLookup() {
    const input = document.getElementById('building_address');
    const panel = document.getElementById('address-suggestions-panel');
    const list = document.getElementById('address-suggestions');
    const status = document.getElementById('address-suggestions-status');
    const key = googleMapsApiKey();
    if (!input || !panel || !list || !key) {
        return;
    }
    // Only now is the field a combobox; without a key it stays a plain text
    // field, announced as one. The browser's own address autofill would open
    // a second list over ours, so it is turned off.
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', 'address-suggestions');
    input.setAttribute('autocomplete', 'off');

    let placesReady = null;
    let unavailable = false;
    // A press inside the list: some touch browsers blur the field before the
    // click arrives, and the list must still be there for it.
    let pressing = false;
    let sessionToken = null;
    let suggestions = [];
    let active = -1;
    let pending = null;
    // Bumped by every lookup and every close, so a late answer to an older
    // lookup never reopens the list.
    let lookupId = 0;

    function loadPlaces() {
        if (!placesReady) {
            placesReady = new Promise((resolve, reject) => {
                window[MAPS_READY_CALLBACK] = resolve;
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://maps.googleapis.com/maps/api/js'
                    + `?key=${encodeURIComponent(key)}&libraries=places&loading=async`
                    + `&callback=${MAPS_READY_CALLBACK}`;
                script.onerror = () => reject(new Error('Google Maps did not load'));
                document.head.appendChild(script);
            }).then(() => {
                const maps = window.google && window.google.maps;
                return maps && typeof maps.importLibrary === 'function'
                    ? maps.importLibrary('places')
                    : maps && maps.places;
            }).then((places) => {
                if (!places || !places.AutocompleteSuggestion) {
                    throw new Error('Google Places is unavailable');
                }
                return places;
            });
            // A failed load leaves a plain text field; nothing else waits on it.
            placesReady.catch((error) => {
                console.warn('Address suggestions unavailable:', error);
                giveUp();
            });
        }
        return placesReady;
    }

    function render() {
        list.textContent = '';
        suggestions.forEach((suggestion, index) => {
            const option = document.createElement('li');
            option.id = `address-suggestion-${index}`;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', index === active ? 'true' : 'false');
            option.textContent = suggestion.text;
            // Pressing keeps focus in the field, so the list is still there
            // for the click that follows; the click picks. An assistive
            // technology may send only the click.
            option.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });
            option.addEventListener('click', () => {
                pressing = false;
                pick(index);
            });
            list.appendChild(option);
            if (index === active && typeof option.scrollIntoView === 'function') {
                option.scrollIntoView({ block: 'nearest' });
            }
        });
        const open = suggestions.length > 0;
        panel.hidden = !open;
        if (status) {
            status.textContent = open
                ? `${suggestions.length} address ${suggestions.length === 1 ? 'suggestion' : 'suggestions'}`
                : '';
        }
        // A field that has gone back to plain text carries no combobox state.
        if (unavailable) {
            return;
        }
        input.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open && active >= 0) {
            input.setAttribute('aria-activedescendant', `address-suggestion-${active}`);
        } else {
            input.removeAttribute('aria-activedescendant');
        }
    }

    // Google failed to load or refused (a spent daily quota, say): the field
    // goes back to a plain address field for the rest of the visit, announced
    // as one and with the browser's address autofill back.
    function giveUp() {
        if (unavailable) {
            return;
        }
        unavailable = true;
        close();
        ['role', 'aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant']
            .forEach((name) => input.removeAttribute(name));
        input.setAttribute('autocomplete', 'street-address');
    }

    function close() {
        // A lookup still waiting on its delay would reopen the list.
        clearTimeout(pending);
        lookupId += 1;
        suggestions = [];
        active = -1;
        render();
    }

    async function lookup(text) {
        lookupId += 1;
        const id = lookupId;
        try {
            const places = await loadPlaces();
            // The visitor may have left or typed on while the script loaded.
            if (id !== lookupId) {
                return;
            }
            if (!sessionToken) {
                sessionToken = new places.AutocompleteSessionToken();
            }
            const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: text,
                sessionToken,
                includedRegionCodes: ['us'],
                includedPrimaryTypes: ADDRESS_PRIMARY_TYPES
            });
            if (id !== lookupId) {
                return;
            }
            suggestions = ((response && response.suggestions) || [])
                .map((suggestion) => suggestion.placePrediction)
                .filter(Boolean)
                .map((prediction) => ({ prediction, text: String(prediction.text || '') }))
                .filter((suggestion) => suggestion.text)
                .slice(0, ADDRESS_SUGGESTION_LIMIT);
            active = -1;
            render();
        } catch (error) {
            // Only the current lookup's failure counts: an older one failing
            // after a newer one succeeded changes nothing.
            if (id === lookupId) {
                giveUp();
            }
        }
    }

    async function pick(index) {
        const chosen = suggestions[index];
        close();
        if (!chosen) {
            return;
        }
        input.value = chosen.text;
        // The pick ends the billing session: the place carries its session
        // token (toPlace), and the next entry starts a new one.
        sessionToken = null;
        try {
            const place = chosen.prediction.toPlace();
            await place.fetchFields({ fields: ['formattedAddress'] });
            // Only if the visitor has not typed over the pick meanwhile.
            if (place.formattedAddress && input.value === chosen.text) {
                input.value = place.formattedAddress;
            }
        } catch (error) {
            // The suggestion's own text stays in the field.
        }
    }

    input.addEventListener('focus', () => {
        if (!unavailable) {
            loadPlaces();
        }
    });
    input.addEventListener('input', () => {
        // Any edit retires the shown suggestions at once, so neither Enter nor
        // a stale option can put an old address back over the edit.
        close();
        const text = (input.value || '').trim();
        // Browser autofill fills the field without focusing it: nobody is
        // there to see a list, so nothing is looked up.
        if (unavailable || document.activeElement !== input || text.length < ADDRESS_LOOKUP_MIN_CHARACTERS) {
            return;
        }
        pending = setTimeout(() => lookup(text), ADDRESS_LOOKUP_DELAY_MS);
    });
    input.addEventListener('keydown', (event) => {
        // Escape also cancels a lookup still waiting, with no list open yet.
        if (event.key === 'Escape') {
            close();
            return;
        }
        if (!suggestions.length) {
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const count = suggestions.length;
            if (event.key === 'ArrowDown') {
                active = active < 0 ? 0 : (active + 1) % count;
            } else {
                active = active < 0 ? count - 1 : (active - 1 + count) % count;
            }
            render();
        } else if (event.key === 'Enter' && active >= 0) {
            // Picks rather than submitting the form.
            event.preventDefault();
            pick(active);
        }
    });
    list.addEventListener('pointerdown', () => {
        pressing = true;
    });
    list.addEventListener('pointercancel', () => {
        pressing = false;
    });
    input.addEventListener('blur', () => {
        if (pressing) {
            return;
        }
        close();
        // Leaving without a pick abandons the session; the next entry starts
        // a new one rather than extending it.
        sessionToken = null;
    });
    closeAddressSuggestions = close;
}

setupFieldChecks();
setupAddressLookup();

if (contactForm) {
    contactForm.addEventListener('submit', async function onSubmit(event) {
        event.preventDefault();

        const form = this;
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : '';

        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        const buildingAddress = (formData.get('building_address') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();
        // The honeypot. Its HTML name avoids anything autofill recognizes; the
        // API still receives it under its contract key, company_website.
        const companyWebsite = (formData.get('reference_code') || '').toString().trim();

        closeAddressSuggestions();

        // Every field is checked, so each problem shows at once, and focus
        // goes to the first one. Nothing is sent until they are fixed.
        const values = { name, email, phone, message };
        const invalid = CONTACT_FIELD_RULES.filter((rule) => !checkContactField(rule, values[rule.id]));
        if (invalid.length > 0) {
            const first = document.getElementById(invalid[0].id);
            if (first && typeof first.focus === 'function') {
                first.focus();
            }
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Sending...</span>';
        }

        const formSubmission = {
            name,
            email,
            phone,
            building_address: buildingAddress,
            message,
            company_website: companyWebsite,
            source: 'website_contact_form_multifamily',
            page_url: trimAttributionUrl(window.location.href),
            referrer: trimAttributionUrl(document.referrer),
            utm: currentUtmProperties()
        };

        // A filled honeypot needs no special case here: the API drops the
        // submission and answers with a null submission_id, and everything that
        // would enter our lead data is gated on that below. The POST still goes
        // out, so the server keeps logging the trap and applying its rate limit.
        try {
            if (typeof getPostHogDistinctId === 'function') {
                formSubmission.posthog_distinct_id = getPostHogDistinctId();
            }
            if (typeof getPostHogSessionId === 'function') {
                formSubmission.posthog_session_id = getPostHogSessionId();
            }

            // The submission goes FIRST. Correlating before it would leave a
            // lead record and PostHog person properties behind for a submission
            // that was never accepted, which happens deterministically on
            // requests 6 to 10 in a minute (correlation allows 10/min, this
            // endpoint 5/min) and on any persistence failure. The lead is not
            // lost by waiting: the submission row stores email_hash and the
            // PostHog ids itself, and the identity backfill builds the
            // pre-signup alias from that row, so a correlation cut off by an
            // early page close costs only the lead_id person property.
            //
            // Throws on a non-2xx, so nothing below runs for a rejected request.
            const result = await submitContactForm(formSubmission);

            // The API answers a dropped submission with 200 and a null
            // submission_id, so that a bot cannot tell it was caught. Only a
            // submission it actually recorded is a real lead: counting the
            // others would report bots as conversions.
            const recorded = Boolean(result && result.submission_id);

            // The submission is recorded and its emails are scheduled, so tell
            // the visitor NOW. Everything below is analytics and must never be
            // able to hold the button disabled or withhold the confirmation: a
            // correlation request that stalled would otherwise leave a visitor
            // staring at a spinner for a submission that already succeeded, and
            // retrying creates duplicates. A dropped submission (the honeypot)
            // gets the same message, so a bot learns nothing from it.
            showMessage('Thanks. We received your request and will reach out shortly.', 'success');
            form.reset();
            resetFieldChecks();

            // Analytics gets its own guard: these are globals from other files,
            // and a throw from one reaching the catch below would replace the
            // confirmation with "could not submit" for a stored lead.
            if (recorded) {
                try {
                    recordContactConversion(email, name);
                } catch (analyticsError) {
                    console.error('Contact analytics error:', analyticsError);
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            // A timeout or a dropped connection is genuinely ambiguous: the
            // request may have been recorded and both emails sent, and we
            // simply never saw the response. Saying "we could not submit" would
            // be a claim we cannot support, and it invites a resubmission that
            // creates a duplicate lead and a second acknowledgement. Say what
            // we actually know.
            const unconfirmed = Boolean(error && error.unconfirmed);
            showMessage(
                unconfirmed
                    ? 'We could not confirm your submission. Please email contact@cohi.energy so we do not miss you.'
                    : 'We could not submit the form right now. Please email contact@cohi.energy.',
                'error'
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    if (!messageDiv) {
        return;
    }

    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.className = 'form-message';
            messageDiv.textContent = '';
        }, 5000);
    }
}

// =============================================================
// CTA click tracking — one delegated listener over every element
// carrying data-cta-destination / data-cta-location. Emits
// `cta_clicked {destination, cta_location}` via the
// trackCTAClick helper from posthog.js when it's loaded.
// =============================================================

function ctaDestinationFor(cta) {
    // navigation.js rewrites [data-account-entry-link] hrefs for
    // authenticated visitors (/register becomes /app or /login), so
    // derive the reported destination from the live href instead of
    // the static attribute.
    if (cta.hasAttribute('data-account-entry-link')) {
        const href = cta.getAttribute('href') || '';
        if (href.includes('/login')) return 'app_login';
        if (href.includes('/register')) return 'app_register';
        return 'app_open';
    }
    return cta.dataset.ctaDestination;
}

document.addEventListener('click', (event) => {
    const cta = event.target.closest('[data-cta-destination]');
    if (!cta) return;
    if (typeof trackCTAClick === 'function') {
        trackCTAClick(ctaDestinationFor(cta), cta.dataset.ctaLocation || 'unknown');
    }
});

// =============================================================
// Mobile nav — hamburger disclosure. Non-modal: Esc closes and
// returns focus to the toggle, and choosing a link closes the
// panel before the browser scrolls to the anchor.
// =============================================================

(function setupNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });
})();
