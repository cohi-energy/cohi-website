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
    const panel = document.getElementById('services-fresh-panel');
    const panelLabel = document.getElementById('services-fresh-label');
    const panelClose = document.getElementById('services-fresh-close');
    const grid = document.getElementById('services-fresh-grid');
    const notice = document.getElementById('services-fresh-notice');
    const noticeHelp = document.getElementById('services-fresh-notice-help');
    const noticeDismiss = document.getElementById('services-fresh-notice-dismiss');
    const modal = document.getElementById('services-fresh-modal');
    const modalLabel = document.getElementById('services-fresh-modal-label');
    const modalTitle = document.getElementById('services-fresh-modal-title');
    const modalCopy = document.getElementById('services-fresh-modal-copy');
    const modalPoints = document.getElementById('services-fresh-modal-points');
    const modalFooter = document.getElementById('services-fresh-modal-footer');
    const modalClose = document.getElementById('services-fresh-modal-close');
    const triggerButtons = box ? Array.from(box.querySelectorAll('[data-fresh-group]')) : [];

    if (
        !box || !panel || !panelLabel || !panelClose || !grid || !notice ||
        !noticeHelp || !noticeDismiss || !modal || !modalLabel ||
        !modalTitle || !modalCopy || !modalPoints || !modalFooter ||
        !modalClose || !triggerButtons.length
    ) {
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

    let activeGroup = null;
    let activeCardButton = null;
    let managerNoticeShown = false;
    let managerNoticeTimer = null;

    function syncTriggers() {
        triggerButtons.forEach((button) => {
            const isActive = button.dataset.freshGroup === activeGroup && !panel.hidden;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function closeModal() {
        if (activeCardButton) {
            activeCardButton.classList.remove('is-active');
            activeCardButton = null;
        }

        modal.hidden = true;
        modalLabel.textContent = '';
        modalTitle.textContent = '';
        modalCopy.textContent = '';
        modalPoints.replaceChildren();
        modalFooter.textContent = '';
    }

    function showManagerNotice() {
        if (managerNoticeTimer) {
            window.clearTimeout(managerNoticeTimer);
        }

        managerNoticeTimer = window.setTimeout(() => {
            notice.hidden = false;
            box.classList.add('is-notice-open');
            managerNoticeTimer = null;
        }, 3000);
    }

    function closeManagerNotice() {
        if (managerNoticeTimer) {
            window.clearTimeout(managerNoticeTimer);
            managerNoticeTimer = null;
        }

        notice.hidden = true;
        box.classList.remove('is-notice-open');
    }

    function openModal(card, button) {
        closeModal();

        const group = serviceGroups[activeGroup];
        if (!group) {
            return;
        }

        if (button) {
            activeCardButton = button;
            activeCardButton.classList.add('is-active');
        }

        modalLabel.textContent = group.modalLabel;
        modalTitle.textContent = card.title;
        modalCopy.textContent = card.detailCopy;
        modalFooter.textContent = card.detailFooter;

        card.detailPoints.forEach((point) => {
            const item = document.createElement('div');
            item.className = 'services-fresh-modal-point';
            item.textContent = point;
            modalPoints.appendChild(item);
        });

        modal.hidden = false;
    }

    function openManagerBenchmarkModal() {
        const managerGroup = serviceGroups.manager;
        const benchmarkCard = managerGroup
            ? managerGroup.cards.find((card) => card.title === 'Energy Benchmarking')
            : null;

        if (!benchmarkCard) {
            return;
        }

        const benchmarkButton = Array.from(grid.querySelectorAll('.services-fresh-card')).find((button) => {
            const title = button.querySelector('.services-fresh-card-title');
            return title && title.textContent === benchmarkCard.title;
        });

        openModal(benchmarkCard, benchmarkButton || null);
    }

    function renderCards(groupKey) {
        const group = serviceGroups[groupKey];
        if (!group) {
            return;
        }

        panelLabel.textContent = group.label;
        grid.replaceChildren();
        closeModal();

        group.cards.forEach((card) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `services-fresh-card services-fresh-card-${card.tone}${card.visual ? ' services-fresh-card-with-visual' : ''}`;
            button.innerHTML = `
                <span class="services-fresh-card-top">
                    <span class="services-fresh-card-pill">${card.kicker}</span>
                    <span class="services-fresh-card-arrow" aria-hidden="true">↗</span>
                </span>
                ${renderCardVisual(card.visual)}
                <span class="services-fresh-card-title">${card.title}</span>
                <span class="services-fresh-card-copy">${card.copy}</span>
            `;
            button.addEventListener('click', () => openModal(card, button));
            grid.appendChild(button);
        });
    }

    /**
     * Each scene is now rendered by the React+framer-motion bundle (`dist/cards-bundle.js`).
     * We just emit a mount point with the matching `data-cohi-card` id; the bundle's
     * MutationObserver picks up the new node and renders the picked pattern into it.
     */
    function renderCardVisual(visualType) {
        const valid = new Set([
            'bill-crush',
            'usage-boulder',
            'incentive-scan',
            'compliance-scan',
            'benchmark-mail',
            'retrofit-bulb',
            'hoa-catch',
            'retrofit-balance',
            'savings',
            'waste',
            'cost',
            'compliance',
        ]);
        if (!valid.has(visualType)) return '';
        return `
                    <span class="services-fresh-card-visual ${visualType}-scene" aria-hidden="true">
                        <div class="cohi-card-mount" data-cohi-card="${visualType}"></div>
                    </span>
                `;
    }

    function openPanel(groupKey) {
        activeGroup = groupKey;
        renderCards(groupKey);
        panel.hidden = false;
        box.classList.add('is-expanded');
        syncTriggers();
    }

    function closePanel() {
        closeManagerNotice();
        closeModal();
        panel.hidden = true;
        grid.replaceChildren();
        activeGroup = null;
        box.classList.remove('is-expanded');
        syncTriggers();
    }

    triggerButtons.forEach((button) => {
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
            const groupKey = button.dataset.freshGroup;
            if (!groupKey) {
                return;
            }

            if (activeGroup === groupKey && !panel.hidden) {
                closePanel();
                return;
            }

            openPanel(groupKey);

            if (groupKey === 'manager' && !managerNoticeShown) {
                managerNoticeShown = true;
                showManagerNotice();
                return;
            }

            closeManagerNotice();
        });
    });

    panelClose.addEventListener('click', closePanel);
    noticeHelp.addEventListener('click', () => {
        if (activeGroup !== 'manager' || panel.hidden) {
            openPanel('manager');
        }

        closeManagerNotice();
        openManagerBenchmarkModal();
    });
    noticeDismiss.addEventListener('click', closeManagerNotice);
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        if (!notice.hidden) {
            closeManagerNotice();
            return;
        }

        if (!modal.hidden) {
            closeModal();
            return;
        }

        if (!panel.hidden) {
            closePanel();
        }
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

            if (typeof trackPostHogEvent === 'function') {
                trackPostHogEvent('contact_form_submitted', {
                    form_type: 'multifamily_consultation'
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
