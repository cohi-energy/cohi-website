(function setupLogoScrollSwap() {
    const LOGO_LIGHT = 'assets/brand/logo-light.svg';
    const LOGO_DARK = 'assets/brand/logo-dark.svg';

    function syncLogo(header) {
        const logo = document.getElementById('logo-image');
        if (!logo) return;
        const next = header.classList.contains('is-scrolled') ? LOGO_DARK : LOGO_LIGHT;
        if (!logo.src.endsWith(next)) {
            logo.src = next;
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const header = document.querySelector('.site-header');
        if (!header) return;
        syncLogo(header);
        const observer = new MutationObserver(() => syncLogo(header));
        observer.observe(header, { attributes: true, attributeFilter: ['class'] });
    });
})();

(function setupHeroVideo() {
    const heroVideo = document.getElementById('hero-video');
    if (!heroVideo) {
        return;
    }

    const LOOP_END_SECONDS = 5;
    const PLAYBACK_RATE = 0.8;

    function getLoopEndTime() {
        if (!Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
            return LOOP_END_SECONDS;
        }

        return Math.min(LOOP_END_SECONDS, Math.max(0.25, heroVideo.duration - 0.05));
    }

    function restartLoopSegment() {
        if (heroVideo.currentTime >= getLoopEndTime()) {
            heroVideo.currentTime = 0;
            if (heroVideo.paused) {
                heroVideo.play().catch(() => {});
            }
        }
    }

    heroVideo.playbackRate = PLAYBACK_RATE;

    heroVideo.addEventListener('loadedmetadata', () => {
        heroVideo.playbackRate = PLAYBACK_RATE;
        if (heroVideo.currentTime > getLoopEndTime()) {
            heroVideo.currentTime = 0;
        }
    });

    heroVideo.addEventListener('timeupdate', restartLoopSegment);
    heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
    });

    heroVideo.play().catch(() => {});
})();

(function setupServicesFreshBox() {
    const box = document.getElementById('services-fresh');
    const accordion = document.getElementById('services-fresh-accordion');
    const pmBanner = document.getElementById('services-fresh-pm-banner');
    const pmBannerCta = document.getElementById('services-fresh-pm-banner-cta');
    const tabButtons = box ? Array.from(box.querySelectorAll('[data-fresh-segment]')) : [];

    if (!box || !accordion || !pmBanner || !pmBannerCta || !tabButtons.length) {
        return;
    }

    const serviceGroups = {
        resident: {
            label: 'For the Individual',
            modalLabel: 'Resident Service',
            cards: [
                {
                    kicker: 'Bill',
                    tone: 'coral',
                    visual: 'cost',
                    title: 'Reducing energy cost',
                    copy: 'Whether the fix is your rate plan, your equipment, or an incentive you don’t know about, we make it happen. No behavior change required.',
                    detailCopy: 'We diagnose what is actually driving your bill — rate plan, usage patterns, or both — then chart the cheapest path back down.',
                    detailPoints: [
                        'Pinpoint whether the bill is high because of rate or usage.',
                        'Quantify exactly how much each driver is costing you.',
                        'Hand you a concrete plan to lower the next bill.'
                    ],
                    detailFooter: 'Useful when the bill suddenly feels too high.'
                },
                {
                    kicker: 'Rates',
                    tone: 'sage',
                    visual: 'bill-crush',
                    title: 'Find Your Best Rate Plan',
                    copy: 'We test every PG&E plan against your real usage and pick the cheapest one.',
                    detailCopy: 'We break down rate structures and billing history so you can see what is driving spend and where savings are realistic.',
                    detailPoints: [
                        'Highlight usage periods that inflate the bill.',
                        'Compare rate plans to identify the plan that suits you.',
                        'Turn the findings into practical next steps.'
                    ],
                    detailFooter: 'Useful when the bill feels high and the cause is unexplained.'
                },
                {
                    kicker: 'Programs',
                    tone: 'amber',
                    visual: 'incentive-scan',
                    title: 'Catch Every Rebate',
                    copy: 'Surfacing the rebates and credits your home qualifies for.',
                    detailCopy: 'We review upgrade goals and property conditions to identify incentive pathways that reduce project cost before work begins.',
                    detailPoints: [
                        'Surface relevant rebate and incentive programs.',
                        'Filter options based on building profile and scope.',
                        'Reduce wasted effort before committing to upgrades.'
                    ],
                    detailFooter: 'Best for owners planning improvements the smart way.'
                },
                {
                    kicker: 'Savings',
                    tone: 'mist',
                    visual: 'savings',
                    title: 'Realized Savings',
                    copy: 'Like getting a small raise. Hundreds more in your account every year.',
                    detailCopy: 'We surface the dollars left on the table each month so the path to lower bills is concrete and trackable.',
                    detailPoints: [
                        'Show monthly and annual savings potential.',
                        'Tie each dollar saved to a specific change.',
                        'Track savings as they materialize.'
                    ],
                    detailFooter: 'Useful when "save money" needs a number attached.'
                }
            ]
        },
        manager: {
            label: 'For the Manager',
            modalLabel: 'Property Manager Service',
            cards: [
                {
                    kicker: 'Planning',
                    tone: 'coral',
                    visual: 'retrofit-balance',
                    title: 'Prioritize Retrofits',
                    copy: 'Sequencing upgrades so the spend lines up with the return.',
                    detailCopy: 'We help managers organize retrofit priorities so efficiency goals do not create avoidable budget or vendor confusion.',
                    detailPoints: [
                        'Rank upgrade options by return and urgency.',
                        'Sharpen scope before working with vendors.',
                        'Balance capital planning with measurable savings.'
                    ],
                    detailFooter: 'Good for teams managing retrofit scope across multiple stakeholders.'
                },
                {
                    kicker: 'Benchmarking',
                    tone: 'mist',
                    visual: 'benchmark-mail',
                    title: 'Hands-Off Benchmarking',
                    copy: 'Filed accurately, filed on time, and off your plate.',
                    detailCopy: 'We take care of the benchmarking process for you, from organizing the right data to preparing a clean submission.',
                    detailPoints: [
                        'Support benchmarking for SF EBO and CA AB 802.',
                        'Ensure data quality before submission.',
                        'Help resolve past violations.'
                    ],
                    detailFooter: 'Designed for multifamily building reporting with a hands-off process for you and your team.'
                },
                {
                    kicker: 'Compliance',
                    tone: 'amber',
                    visual: 'compliance-scan',
                    title: 'Regulatory Watch',
                    copy: 'Spotting new ordinances and rule changes before they become a deadline.',
                    detailCopy: 'We support ordinance readiness by clarifying deadlines, required reporting, and the steps needed to keep compliance on track.',
                    detailPoints: [
                        'Clarify requirements and submission timelines.',
                        'Reduce missed deadlines and incomplete reporting.',
                        'Watch for policy changes that may affect future compliance requirements.'
                    ],
                    detailFooter: 'Best for buildings facing multiple reporting obligations.'
                },
                {
                    kicker: 'Retrofits',
                    tone: 'sage',
                    visual: 'retrofit-bulb',
                    title: 'Scope Retrofits Cleanly',
                    copy: 'Pointing you to the upgrades with the highest payback.',
                    detailCopy: 'We help managers map retrofit decisions in a way that balances savings, disruption, capital planning, and building realities.',
                    detailPoints: [
                        'Rank improvements by impact and timing.',
                        'Separate high-return upgrades from lower-value work.',
                        'Support phased planning before implementation starts.'
                    ],
                    detailFooter: 'Designed for managers who need clarity before making upgrades.'
                }
            ]
        }
    };

    let activeSegment = 'manager';
    /** Remembers which row is expanded per segment so tab-switching restores
     *  the user's last pick instead of always jumping to #01. Set to -1 to
     *  indicate "all collapsed". */
    const expandedBySegment = { resident: 0, manager: 0 };

    function padIndex(i) {
        return String(i + 1).padStart(2, '0');
    }

    function renderAccordion() {
        const group = serviceGroups[activeSegment];
        const expanded = expandedBySegment[activeSegment];

        accordion.replaceChildren();
        group.cards.forEach((card, idx) => {
            const isOpen = idx === expanded;
            const row = document.createElement('article');
            row.className = `services-fresh-row ${isOpen ? 'is-open' : ''}`;
            row.dataset.freshRow = String(idx);

            const visualMarkup = card.visual
                ? `<div class="services-fresh-row-visual" aria-hidden="true">
                       <div class="cohi-card-mount" data-cohi-card="${card.visual}"></div>
                   </div>`
                : '';

            const pointsMarkup = (card.detailPoints || [])
                .map((point) => `<li class="services-fresh-row-point">${point}</li>`)
                .join('');

            row.innerHTML = `
                <button type="button" class="services-fresh-row-head" aria-expanded="${isOpen ? 'true' : 'false'}" aria-controls="services-fresh-row-body-${idx}">
                    <span class="services-fresh-row-index" aria-hidden="true">${padIndex(idx)}</span>
                    <span class="services-fresh-row-title">${card.title}</span>
                    <span class="services-fresh-row-chevron" aria-hidden="true">+</span>
                </button>
                <div id="services-fresh-row-body-${idx}" class="services-fresh-row-body" ${isOpen ? '' : 'hidden'}>
                    <div class="services-fresh-row-body-inner">
                        ${visualMarkup}
                        <div class="services-fresh-row-copy">
                            <p class="services-fresh-row-kicker">${group.modalLabel}</p>
                            <p class="services-fresh-row-lede">${card.detailCopy}</p>
                            ${pointsMarkup ? `<ul class="services-fresh-row-points">${pointsMarkup}</ul>` : ''}
                            ${card.detailFooter ? `<p class="services-fresh-row-footer">${card.detailFooter}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            accordion.appendChild(row);
        });
    }

    function toggleRow(idx) {
        const current = expandedBySegment[activeSegment];
        expandedBySegment[activeSegment] = current === idx ? -1 : idx;
        renderAccordion();
    }

    function applySegment(segment) {
        if (!serviceGroups[segment]) return;
        activeSegment = segment;

        tabButtons.forEach((tab) => {
            const isActive = tab.dataset.freshSegment === segment;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        pmBanner.hidden = segment !== 'manager';
        renderAccordion();
    }

    function jumpToBenchmarking() {
        const managerCards = serviceGroups.manager.cards;
        const idx = managerCards.findIndex((card) => card.visual === 'benchmark-mail');
        if (idx < 0) return;
        expandedBySegment.manager = idx;
        applySegment('manager');
    }

    applySegment(activeSegment);

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const segment = button.dataset.freshSegment;
            if (segment) applySegment(segment);
        });
    });

    pmBannerCta.addEventListener('click', jumpToBenchmarking);

    accordion.addEventListener('click', (event) => {
        const head = event.target.closest('.services-fresh-row-head');
        if (!head) return;
        const row = head.closest('[data-fresh-row]');
        if (row) toggleRow(Number(row.dataset.freshRow));
    });
})();

(function setupHeaderScrollState() {
    const header = document.querySelector('.site-header');
    const hero = document.querySelector('.hero');
    if (!header) {
        return;
    }

    function syncHeaderState() {
        if (!hero) {
            header.classList.toggle('is-scrolled', window.scrollY > 10);
            return;
        }

        const heroBottom = hero.getBoundingClientRect().bottom;
        const headerBottom = header.getBoundingClientRect().bottom;
        header.classList.toggle('is-scrolled', headerBottom >= heroBottom);
    }

    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
    window.addEventListener('resize', syncHeaderState, { passive: true });
})();

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

async function recordContactSubmissionAnalytics({ name, email, leadCorrelation }) {
    try {
        const appOrigin = resolveAppOriginForAnalytics();
        const response = await fetch(`${appOrigin}/api/analytics/contact-submission`, {
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
        if (!response.ok) {
            return false;
        }
        const payload = await response.json();
        return Boolean(payload && payload.recorded);
    } catch {
        return false;
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

            if (typeof trackRedditConversion === 'function') {
                trackRedditConversion('Lead');
            }

            const recordedServerSide = await recordContactSubmissionAnalytics({
                name,
                email,
                leadCorrelation
            });

            if (!recordedServerSide && typeof trackPostHogEvent === 'function') {
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
