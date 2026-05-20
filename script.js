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

    const mobileRevealQuery = window.matchMedia
        ? window.matchMedia('(max-width: 767px)')
        : { matches: false };

    function revealProgressForTop(top, startY, range) {
        let p = (startY - top) / range;
        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        return p;
    }

    function update() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // Start the reveal when the step's top is at the viewport
        // bottom; complete when it's at the 50 % line. Tweak END_RATIO
        // upward to delay completion, downward to finish sooner.
        const START_RATIO = 1.0;
        const END_RATIO   = 0.5;
        const startY = vh * START_RATIO;
        const endY   = vh * END_RATIO;
        const range  = startY - endY;
        const isMobileReveal = mobileRevealQuery.matches;
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const top = step.getBoundingClientRect().top;
            const p = revealProgressForTop(top, startY, range);
            step.style.setProperty('--reveal-progress', p.toFixed(3));

            const targets = step.querySelectorAll('.process-text, .process-scene-col');
            targets.forEach((target) => {
                const targetTop = isMobileReveal ? target.getBoundingClientRect().top : top;
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
// Contact form — POSTs to the Google Apps Script Web App URL
// defined in config.js, creates a lead-correlation record on
// the app, and tracks the submission in PostHog + Reddit.
// Ported from the production website/script.js so website-next
// has parity when it replaces the homepage. External symbols
// (GOOGLE_APPS_SCRIPT_URL, trackPostHogEvent, setLeadPostHogProperties,
// getPostHogDistinctId/SessionId, trackRedditConversion,
// window.cohiNavigation.resolveAppOrigin, APP_BASE_URL) come from
// config.js + posthog.js + reddit-pixel.js + navigation.js.
// =============================================================

const contactForm = document.getElementById('contact-form');

function resolveAppOriginForAnalytics() {
    if (window.cohiNavigation && typeof window.cohiNavigation.resolveAppOrigin === 'function') {
        return window.cohiNavigation.resolveAppOrigin();
    }
    if (typeof APP_BASE_URL !== 'undefined' && APP_BASE_URL) {
        return new URL(APP_BASE_URL, window.location.origin).origin;
    }
    return window.location.hostname === 'cohi.energy'
        ? 'https://app.cohi.energy'
        : window.location.origin;
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

async function createLeadCorrelation(email) {
    try {
        const appOrigin = resolveAppOriginForAnalytics();
        const response = await fetch(`${appOrigin}/api/analytics/lead-correlation`, {
            method: 'POST',
            mode: 'cors',
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
        return response.json();
    } catch {
        return null;
    }
}

async function recordContactSubmissionAnalytics({ email, name, leadCorrelation }) {
    try {
        const appOrigin = resolveAppOriginForAnalytics();
        await fetch(`${appOrigin}/api/analytics/contact-submission`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                name,
                lead_id: leadCorrelation ? leadCorrelation.lead_id : null,
                lead_email_hash: leadCorrelation ? leadCorrelation.lead_email_hash : null,
                posthog_distinct_id: typeof getPostHogDistinctId === 'function' ? getPostHogDistinctId() : null,
                posthog_session_id: typeof getPostHogSessionId === 'function' ? getPostHogSessionId() : null,
                source: 'website_contact_form_multifamily',
                utm: currentUtmProperties()
            })
        });
    } catch {
        // Best effort only; the Apps Script submission remains the user-facing source of truth.
    }
}

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

        if (!name || !email || !phone || !buildingAddress) {
            showMessage('Please complete name, email, phone number, and address.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Sending...</span>';
        }

        const formSubmission = {
            name,
            email,
            building_address: buildingAddress,
            address: buildingAddress,
            buildingAddress,
            phone,
            message,
            timestamp: new Date().toISOString(),
            source: 'website_contact_form_multifamily'
        };

        try {
            const leadCorrelation = await createLeadCorrelation(email);
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
            if (leadCorrelation) {
                formSubmission.lead_id = leadCorrelation.lead_id;
                formSubmission.lead_email_hash = leadCorrelation.lead_email_hash;
            }

            if (typeof GOOGLE_APPS_SCRIPT_URL === 'undefined' || !GOOGLE_APPS_SCRIPT_URL) {
                throw new Error('Missing form endpoint configuration.');
            }

            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formSubmission)
            });

            await recordContactSubmissionAnalytics({ email, name, leadCorrelation });

            if (typeof trackRedditConversion === 'function') {
                trackRedditConversion('Lead');
            }

            if (typeof trackPostHogEvent === 'function') {
                trackPostHogEvent('contact_form_submitted', {
                    form_type: 'multifamily_consultation',
                    lead_id: leadCorrelation ? leadCorrelation.lead_id : undefined,
                    lead_email_hash: leadCorrelation ? leadCorrelation.lead_email_hash : undefined
                });
            }

            showMessage('Thanks. We received your request and will reach out shortly.', 'success');
            form.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('We could not submit the form right now. Please email contact@cohi.energy.', 'error');
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
