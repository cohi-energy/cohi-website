(function logoFallback() {
    const logoExtensions = ['svg', 'png', 'jpg', 'jpeg'];
    let currentAttempt = 0;

    function tryNextLogo() {
        const logoImg = document.getElementById('logo-image');
        const logoText = document.getElementById('logo-text');

        if (!logoImg) {
            return;
        }

        if (currentAttempt < logoExtensions.length) {
            logoImg.src = `logo.${logoExtensions[currentAttempt]}`;
            currentAttempt += 1;
            return;
        }

        logoImg.style.display = 'none';
        if (logoText) {
            logoText.style.display = 'inline-block';
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const logoImg = document.getElementById('logo-image');
        if (!logoImg) {
            return;
        }

        logoImg.onerror = tryNextLogo;
        if (!logoImg.src || (logoImg.complete && logoImg.naturalHeight === 0)) {
            tryNextLogo();
        }
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
                    kicker: 'Rates',
                    tone: 'sage',
                    visual: 'bill-crush',
                    title: 'Bill Rate Analysis',
                    copy: 'Finding the plan that beats your cost.',
                    detailCopy: 'We break down rate structures and billing history so you can see what is driving spend and where savings are realistic.',
                    detailPoints: [
                        'Highlight usage periods that inflate the bill.',
                        'Compare rate plans to identify the plan that suits you.',
                        'Turn the findings into practical next steps.'
                    ],
                    detailFooter: 'Useful when the bill feels high and the cause is unexplained.'
                },
                {
                    kicker: 'Usage',
                    tone: 'mist',
                    visual: 'usage-boulder',
                    title: 'Usage Analysis',
                    copy: 'Crushing your climbing energy use.',
                    detailCopy: 'We turn raw usage data into a clear picture of how the building consumes energy across days, seasons, and equipment loads.',
                    detailPoints: [
                        'Map peak windows and recurring inefficiencies.',
                        'Connect patterns to behavior or building systems.',
                        'Prioritize the easiest savings opportunities first.'
                    ],
                    detailFooter: 'Built to turn utility data into a clean action plan.'
                },
                {
                    kicker: 'Programs',
                    tone: 'amber',
                    visual: 'incentive-scan',
                    title: 'Incentive Eligibility',
                    copy: 'Finding the incentives that work for you.',
                    detailCopy: 'We review upgrade goals and property conditions to identify incentive pathways that reduce project cost before work begins.',
                    detailPoints: [
                        'Surface relevant rebate and incentive programs.',
                        'Filter options based on building profile and scope.',
                        'Reduce wasted effort before committing to upgrades.'
                    ],
                    detailFooter: 'Best for owners planning improvements the smart way.'
                },
                {
                    kicker: 'Retrofits',
                    tone: 'coral',
                    visual: 'retrofit-bulb',
                    title: 'Retrofitting Guidance',
                    copy: 'Highest impact, lowest cost.',
                    detailCopy: 'We help map retrofit decisions in a way that balances savings, disruption, capital planning, and building realities.',
                    detailPoints: [
                        'Rank improvements by impact and timing.',
                        'Separate high-return upgrades from lower-value work.',
                        'Support phased planning before implementation starts.'
                    ],
                    detailFooter: 'Designed for owners who need clarity before making upgrades.'
                }
            ]
        },
        manager: {
            label: 'For the Manager',
            modalLabel: 'Property Manager Service',
            cards: [
                {
                    kicker: 'Operations',
                    tone: 'sage',
                    visual: 'hoa-catch',
                    title: 'Reducing Utility OPEX',
                    copy: 'Catching utility savings before they slip away.',
                    detailCopy: 'We review billing structure for common-area and portfolio loads to find cost issues that can be corrected quickly.',
                    detailPoints: [
                        'Review common-area billing patterns and charges.',
                        'Spot rate issues and avoidable monthly leakage.',
                        'Package findings clearly for boards and stakeholders.'
                    ],
                    detailFooter: 'Useful for properties carrying meaningful shared utility spend.'
                },
                {
                    kicker: 'Planning',
                    tone: 'coral',
                    visual: 'retrofit-balance',
                    title: 'Retrofit Optimization',
                    copy: 'Weighing what gives the best value for your savings.',
                    detailCopy: 'We help managers organize retrofit priorities so efficiency goals do not create avoidable budget or vendor confusion.',
                    detailPoints: [
                        'Rank upgrade options by return and urgency.',
                        'Sharpen scope before working with vendors.',
                        'Balance capital planning with measurable savings.'
                    ],
                    detailFooter: 'Good for teams managing retrofit scope across multiple stakeholders.'
                },
                {
                    kicker: 'Compliance',
                    tone: 'amber',
                    visual: 'compliance-scan',
                    title: 'Compliance',
                    copy: 'Making sure you stay on top of compliance now and in the future.',
                    detailCopy: 'We support ordinance readiness by clarifying deadlines, required reporting, and the steps needed to keep compliance on track.',
                    detailPoints: [
                        'Clarify requirements and submission timelines.',
                        'Reduce missed deadlines and incomplete reporting.',
                        'Watch for policy changes that may affect future compliance requirements.'
                    ],
                    detailFooter: 'Best for buildings facing multiple reporting obligations.'
                },
                {
                    kicker: 'Benchmarking',
                    tone: 'mist',
                    visual: 'benchmark-mail',
                    title: 'Energy Benchmarking',
                    copy: 'Submitting your energy benchmarking accurately, on time, and stress-free.',
                    detailCopy: 'We take care of the benchmarking process for you, from organizing the right data to preparing a clean submission.',
                    detailPoints: [
                        'Support benchmarking for SF EBO and CA AB 802.',
                        'Ensure data quality before submission.',
                        'Help resolve past violations.'
                    ],
                    detailFooter: 'Designed for multifamily building reporting with a hands-off process for you and your team.'
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

    function renderCardVisual(visualType) {
        switch (visualType) {
            case 'bill-crush':
                return `
                    <span class="services-fresh-card-visual bill-crush-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="bill-crush-surface" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#f7fbf8"></stop>
                                    <stop offset="100%" stop-color="#e8f1ec"></stop>
                                </linearGradient>
                                <linearGradient id="bill-crush-coin" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff9b7"></stop>
                                    <stop offset="100%" stop-color="#f2d86c"></stop>
                                </linearGradient>
                                <linearGradient id="bill-crush-mallet-head" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#e95b4b"></stop>
                                    <stop offset="100%" stop-color="#b8342f"></stop>
                                </linearGradient>
                                <linearGradient id="bill-crush-handle" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#c89352"></stop>
                                    <stop offset="100%" stop-color="#8c5c34"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#bill-crush-surface)"></rect>
                            <ellipse cx="160" cy="138" rx="82" ry="20" fill="rgba(47, 102, 88, 0.12)"></ellipse>

                            <g class="bill-crush-cluster">
                                <g class="bill-crush-coin coin-a">
                                    <circle cx="118" cy="72" r="26" fill="url(#bill-crush-coin)"></circle>
                                    <text x="118" y="81" text-anchor="middle">$</text>
                                </g>
                                <g class="bill-crush-coin coin-b">
                                    <circle cx="202" cy="72" r="26" fill="url(#bill-crush-coin)"></circle>
                                    <text x="202" y="81" text-anchor="middle">$</text>
                                </g>
                                <g class="bill-crush-coin coin-c">
                                    <circle cx="136" cy="118" r="26" fill="url(#bill-crush-coin)"></circle>
                                    <text x="136" y="127" text-anchor="middle">$</text>
                                </g>
                                <g class="bill-crush-coin coin-d">
                                    <circle cx="184" cy="118" r="26" fill="url(#bill-crush-coin)"></circle>
                                    <text x="184" y="127" text-anchor="middle">$</text>
                                </g>
                            </g>

                            <g class="bill-crush-pop pop-a">
                                <circle class="pop-ring" cx="118" cy="72" r="18"></circle>
                                <polygon class="impact-core" points="118,54 125,65 138,63 130,74 142,84 128,85 125,97 118,89 111,97 108,85 94,84 106,74 98,63 111,65"></polygon>
                                <circle class="pop-dot" cx="96" cy="58" r="4"></circle>
                                <circle class="pop-dot" cx="142" cy="56" r="5"></circle>
                                <circle class="pop-dot" cx="118" cy="40" r="4"></circle>
                            </g>

                            <g class="bill-crush-pop pop-b">
                                <circle class="pop-ring" cx="202" cy="72" r="18"></circle>
                                <polygon class="impact-core" points="202,54 209,65 222,63 214,74 226,84 212,85 209,97 202,89 195,97 192,85 178,84 190,74 182,63 195,65"></polygon>
                                <circle class="pop-dot" cx="180" cy="58" r="4"></circle>
                                <circle class="pop-dot" cx="226" cy="56" r="5"></circle>
                                <circle class="pop-dot" cx="202" cy="40" r="4"></circle>
                            </g>

                            <g class="bill-crush-pop pop-c">
                                <circle class="pop-ring" cx="136" cy="118" r="18"></circle>
                                <polygon class="impact-core" points="136,100 143,111 156,109 148,120 160,130 146,131 143,143 136,135 129,143 126,131 112,130 124,120 116,109 129,111"></polygon>
                                <circle class="pop-dot" cx="114" cy="104" r="4"></circle>
                                <circle class="pop-dot" cx="160" cy="102" r="5"></circle>
                                <circle class="pop-dot" cx="136" cy="86" r="4"></circle>
                            </g>

                            <g class="bill-crush-mallet">
                                <rect x="205" y="18" width="72" height="34" rx="17" fill="url(#bill-crush-mallet-head)"></rect>
                                <rect x="234" y="48" width="14" height="82" rx="7" fill="url(#bill-crush-handle)"></rect>
                                <rect x="228" y="48" width="6" height="82" rx="3" fill="#dfbf8e" opacity="0.85"></rect>
                            </g>
                        </svg>
                    </span>
                `;
            case 'usage-boulder':
                return `
                    <span class="services-fresh-card-visual usage-boulder-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="usage-sky" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#eef7ff"></stop>
                                    <stop offset="100%" stop-color="#dcecff"></stop>
                                </linearGradient>
                                <linearGradient id="usage-mountain" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#7c98b8"></stop>
                                    <stop offset="100%" stop-color="#47657f"></stop>
                                </linearGradient>
                                <linearGradient id="usage-ridge" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#a9c1d9"></stop>
                                    <stop offset="100%" stop-color="#6b89a8"></stop>
                                </linearGradient>
                                <linearGradient id="usage-boulder" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#a8b2bb"></stop>
                                    <stop offset="100%" stop-color="#6d7985"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#usage-sky)"></rect>
                            <path d="M34 148 L126 56 L200 108 L286 148 Z" fill="url(#usage-mountain)"></path>
                            <path d="M118 68 L150 92 L190 120" fill="none" stroke="url(#usage-ridge)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"></path>
                            <ellipse cx="178" cy="146" rx="86" ry="18" fill="rgba(52, 78, 102, 0.14)"></ellipse>

                            <g class="usage-boulder-bolt">
                                <polygon points="208,36 190,70 212,70 192,106 236,60 214,60 230,36" fill="#ffe169" stroke="#d3a316" stroke-width="3" stroke-linejoin="round"></polygon>
                            </g>

                            <g class="usage-boulder-rock">
                                <circle cx="118" cy="66" r="24" fill="url(#usage-boulder)"></circle>
                                <circle cx="110" cy="60" r="6" fill="rgba(255,255,255,0.18)"></circle>
                                <path d="M104 72 Q118 82 132 70" fill="none" stroke="rgba(77, 87, 98, 0.45)" stroke-width="3" stroke-linecap="round"></path>
                            </g>

                            <g class="usage-boulder-impact">
                                <polygon points="214,56 220,68 234,66 226,76 238,88 224,88 220,102 212,92 200,102 202,88 188,88 198,76 190,66 204,68" class="usage-boulder-impact-star"></polygon>
                                <circle cx="194" cy="60" r="4" class="usage-boulder-impact-dot"></circle>
                                <circle cx="236" cy="54" r="5" class="usage-boulder-impact-dot"></circle>
                                <circle cx="246" cy="78" r="4" class="usage-boulder-impact-dot"></circle>
                            </g>

                            <g class="usage-boulder-dust">
                                <circle cx="220" cy="128" r="8" class="usage-boulder-dust-dot dust-a"></circle>
                                <circle cx="238" cy="136" r="6" class="usage-boulder-dust-dot dust-b"></circle>
                                <circle cx="254" cy="142" r="5" class="usage-boulder-dust-dot dust-c"></circle>
                            </g>
                        </svg>
                    </span>
                `;
            case 'incentive-scan':
                return `
                    <span class="services-fresh-card-visual incentive-scan-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="incentive-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff9e7"></stop>
                                    <stop offset="100%" stop-color="#f6efd5"></stop>
                                </linearGradient>
                                <linearGradient id="incentive-paper" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fffdf7"></stop>
                                    <stop offset="100%" stop-color="#f7f1df"></stop>
                                </linearGradient>
                                <linearGradient id="incentive-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="rgba(255,255,255,0.72)"></stop>
                                    <stop offset="100%" stop-color="rgba(194, 231, 246, 0.34)"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#incentive-bg)"></rect>
                            <ellipse cx="164" cy="145" rx="98" ry="18" fill="rgba(143, 118, 46, 0.12)"></ellipse>

                            <g class="incentive-paper-stack">
                                <rect x="92" y="20" width="132" height="134" rx="18" fill="rgba(210, 190, 139, 0.28)"></rect>
                                <rect x="84" y="16" width="132" height="134" rx="18" fill="url(#incentive-paper)" stroke="rgba(192, 165, 101, 0.4)" stroke-width="2"></rect>

                                <svg x="90" y="22" width="120" height="122" viewBox="90 22 120 122" class="incentive-paper-window">
                                <g class="incentive-paper-scroll">
                                    <text x="150" y="44" text-anchor="middle" class="incentive-paper-heading">CA</text>
                                    <rect x="106" y="56" width="88" height="8" rx="4" class="incentive-paper-line"></rect>
                                    <rect x="106" y="72" width="72" height="8" rx="4" class="incentive-paper-line"></rect>
                                    <rect x="106" y="88" width="80" height="8" rx="4" class="incentive-paper-line"></rect>
                                    <rect x="106" y="104" width="76" height="8" rx="4" class="incentive-paper-line"></rect>
                                    <rect x="106" y="118" width="86" height="8" rx="4" class="incentive-paper-line"></rect>
                                    <rect x="106" y="134" width="82" height="8" rx="4" class="incentive-paper-line"></rect>
                                </g>
                                </svg>
                            </g>

                            <g class="incentive-magnifier">
                                <circle cx="168" cy="96" r="34" fill="url(#incentive-glass)" stroke="#4f6f8e" stroke-width="6"></circle>
                                <circle cx="168" cy="96" r="25" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3"></circle>
                                <g class="incentive-lens-values">
                                    <text x="152" y="81" class="incentive-lens-dollar lens-dollar-a">$</text>
                                    <text x="166" y="97" class="incentive-lens-dollar lens-dollar-b">$</text>
                                    <text x="178" y="113" class="incentive-lens-dollar lens-dollar-c">$</text>
                                </g>
                                <rect x="192" y="119" width="16" height="40" rx="8" transform="rotate(-38 200 139)" fill="#6f8292"></rect>
                                <rect x="196" y="124" width="6" height="34" rx="3" transform="rotate(-38 199 141)" fill="rgba(255,255,255,0.35)"></rect>
                            </g>
                        </svg>
                    </span>
                `;
            case 'compliance-scan':
                return `
                    <span class="services-fresh-card-visual compliance-scan-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="compliance-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff4e7"></stop>
                                    <stop offset="100%" stop-color="#f1e0cb"></stop>
                                </linearGradient>
                                <linearGradient id="compliance-paper" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fffdf8"></stop>
                                    <stop offset="100%" stop-color="#f6eddc"></stop>
                                </linearGradient>
                                <linearGradient id="compliance-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="rgba(255,255,255,0.78)"></stop>
                                    <stop offset="100%" stop-color="rgba(204,225,239,0.5)"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#compliance-bg)"></rect>
                            <ellipse cx="160" cy="144" rx="96" ry="16" fill="rgba(120, 89, 47, 0.12)"></ellipse>

                            <g class="compliance-paper-stack">
                                <rect x="94" y="22" width="132" height="134" rx="18" fill="rgba(186, 152, 102, 0.18)"></rect>
                                <rect x="84" y="16" width="132" height="134" rx="18" fill="url(#compliance-paper)" stroke="rgba(192, 165, 101, 0.4)" stroke-width="2"></rect>

                                <svg x="90" y="22" width="120" height="122" viewBox="90 22 120 122" class="compliance-paper-window">
                                    <g class="compliance-paper-scroll">
                                        <text x="150" y="42" text-anchor="middle" class="compliance-paper-heading">Compliance</text>
                                        <text x="108" y="62" class="compliance-paper-text">SF EBO</text>
                                        <text x="108" y="80" class="compliance-paper-text">AB 802</text>
                                        <text x="108" y="98" class="compliance-paper-text">All Electric</text>
                                        <rect x="106" y="112" width="86" height="7" rx="3.5" class="compliance-paper-line"></rect>
                                        <rect x="106" y="126" width="78" height="7" rx="3.5" class="compliance-paper-line"></rect>
                                        <rect x="106" y="140" width="84" height="7" rx="3.5" class="compliance-paper-line"></rect>
                                        <rect x="106" y="154" width="74" height="7" rx="3.5" class="compliance-paper-line"></rect>

                                        <g class="compliance-paper-heater">
                                            <ellipse cx="150" cy="192" rx="18" ry="7" fill="#c7d0d5"></ellipse>
                                            <rect x="132" y="192" width="36" height="42" rx="14" fill="#b7c2c9"></rect>
                                            <ellipse cx="150" cy="234" rx="18" ry="7" fill="#9eabb4"></ellipse>
                                            <path d="M150 184 L150 172" stroke="#8f7a66" stroke-width="5" stroke-linecap="round"></path>
                                            <path d="M150 198 C144 206 145 216 150 220 C155 216 156 206 150 198 Z" fill="#f0954a"></path>
                                        </g>
                                    </g>
                                </svg>
                            </g>

                            <g class="compliance-magnifier">
                                <circle cx="160" cy="98" r="34" fill="url(#compliance-glass)" stroke="#4f6f8e" stroke-width="6"></circle>
                                <path d="M185 123 L212 148" stroke="#4f6f8e" stroke-width="9" stroke-linecap="round"></path>

                                <g class="compliance-lens-heater">
                                    <ellipse cx="156" cy="94" rx="15" ry="6" fill="rgba(198, 207, 212, 0.95)"></ellipse>
                                    <rect x="141" y="94" width="30" height="34" rx="12" fill="#bcc7cd"></rect>
                                    <ellipse cx="156" cy="128" rx="15" ry="6" fill="#9ba7af"></ellipse>
                                    <path d="M156 87 L156 76" stroke="#857260" stroke-width="4.5" stroke-linecap="round"></path>
                                    <path d="M156 100 C151 107 152 115 156 118 C160 115 161 107 156 100 Z" fill="#ee8f42"></path>
                                </g>

                                <g class="compliance-lens-cross">
                                    <circle cx="179" cy="79" r="13" fill="#db5b4f"></circle>
                                    <path d="M173 73 L185 85" stroke="#fff8f3" stroke-width="4" stroke-linecap="round"></path>
                                    <path d="M185 73 L173 85" stroke="#fff8f3" stroke-width="4" stroke-linecap="round"></path>
                                </g>
                            </g>
                        </svg>
                    </span>
                `;
            case 'benchmark-mail':
                return `
                    <span class="services-fresh-card-visual benchmark-mail-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="benchmark-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#eef5f9"></stop>
                                    <stop offset="100%" stop-color="#dbe7ef"></stop>
                                </linearGradient>
                                <linearGradient id="benchmark-paper" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fffdf9"></stop>
                                    <stop offset="100%" stop-color="#f2f5f7"></stop>
                                </linearGradient>
                                <linearGradient id="benchmark-envelope" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff8ec"></stop>
                                    <stop offset="100%" stop-color="#eadfcb"></stop>
                                </linearGradient>
                                <linearGradient id="benchmark-city" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#879fb0"></stop>
                                    <stop offset="100%" stop-color="#5b7486"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#benchmark-bg)"></rect>
                            <ellipse cx="160" cy="145" rx="102" ry="16" fill="rgba(75, 103, 121, 0.12)"></ellipse>

                            <g class="benchmark-stage benchmark-source-paper">
                                <rect x="86" y="22" width="148" height="122" rx="18" fill="url(#benchmark-paper)" stroke="rgba(154, 173, 184, 0.5)" stroke-width="2"></rect>
                                <text x="160" y="40" text-anchor="middle" class="benchmark-paper-title">Benchmarking</text>

                                <g class="benchmark-chart chart-energy">
                                    <rect x="100" y="52" width="52" height="58" rx="12" class="benchmark-chart-panel"></rect>
                                    <polygon points="112,62 104,78 112,78 106,94 122,74 114,74" class="benchmark-icon-energy"></polygon>
                                    <rect x="122" y="84" width="8" height="18" rx="4" class="benchmark-bar bar-a"></rect>
                                    <rect x="134" y="74" width="8" height="28" rx="4" class="benchmark-bar bar-b"></rect>
                                </g>

                                <g class="benchmark-chart chart-fire">
                                    <rect x="168" y="52" width="52" height="58" rx="12" class="benchmark-chart-panel"></rect>
                                    <path d="M180 92 C174 82 177 70 186 62 C188 72 194 75 194 84 C194 92 188 98 184 100 C180 98 176 95 176 90 C176 87 178 84 180 82" class="benchmark-icon-fire"></path>
                                    <rect x="194" y="86" width="8" height="16" rx="4" class="benchmark-bar bar-c"></rect>
                                    <rect x="206" y="70" width="8" height="32" rx="4" class="benchmark-bar bar-d"></rect>
                                </g>

                                <rect x="100" y="120" width="112" height="6" rx="3" class="benchmark-paper-line"></rect>
                                <rect x="100" y="131" width="92" height="6" rx="3" class="benchmark-paper-line"></rect>
                            </g>

                            <g class="benchmark-stage benchmark-envelope-single">
                                <rect x="112" y="58" width="96" height="64" rx="12" fill="url(#benchmark-envelope)" stroke="rgba(171, 152, 116, 0.55)" stroke-width="2"></rect>
                                <path d="M112 70 L160 102 L208 70" fill="none" stroke="rgba(171, 152, 116, 0.8)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M112 118 L146 90" fill="none" stroke="rgba(171, 152, 116, 0.7)" stroke-width="3" stroke-linecap="round"></path>
                                <path d="M208 118 L174 90" fill="none" stroke="rgba(171, 152, 116, 0.7)" stroke-width="3" stroke-linecap="round"></path>
                            </g>

                            <g class="benchmark-stage benchmark-city benchmark-city-sf">
                                <polygon points="71,48 36,68 106,68" fill="#6d879a"></polygon>
                                <rect x="40" y="68" width="62" height="8" rx="3" fill="#7691a2"></rect>
                                <rect x="46" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="60" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="74" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="88" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="38" y="112" width="66" height="12" rx="4" fill="url(#benchmark-city)"></rect>
                                <text x="71" y="137" text-anchor="middle" class="benchmark-city-label">SF</text>
                            </g>

                            <g class="benchmark-stage benchmark-city benchmark-city-ca">
                                <polygon points="249,48 214,68 284,68" fill="#6d879a"></polygon>
                                <rect x="218" y="68" width="62" height="8" rx="3" fill="#7691a2"></rect>
                                <rect x="224" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="238" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="252" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="266" y="76" width="8" height="36" rx="3" class="benchmark-city-window"></rect>
                                <rect x="216" y="112" width="66" height="12" rx="4" fill="url(#benchmark-city)"></rect>
                                <text x="249" y="137" text-anchor="middle" class="benchmark-city-label">CA</text>
                            </g>

                            <g class="benchmark-stage benchmark-envelope benchmark-envelope-sf">
                                <rect x="58" y="56" width="40" height="28" rx="6" fill="url(#benchmark-envelope)" stroke="rgba(171, 152, 116, 0.55)" stroke-width="2"></rect>
                                <path d="M58 62 L78 76 L98 62" fill="none" stroke="rgba(171, 152, 116, 0.8)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </g>

                            <g class="benchmark-stage benchmark-envelope benchmark-envelope-ca">
                                <rect x="222" y="56" width="40" height="28" rx="6" fill="url(#benchmark-envelope)" stroke="rgba(171, 152, 116, 0.55)" stroke-width="2"></rect>
                                <path d="M222 62 L242 76 L262 62" fill="none" stroke="rgba(171, 152, 116, 0.8)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                            </g>

                            <g class="benchmark-stage benchmark-result-paper">
                                <rect x="82" y="22" width="156" height="122" rx="18" fill="url(#benchmark-paper)" stroke="rgba(154, 173, 184, 0.5)" stroke-width="2"></rect>
                                <text x="160" y="42" text-anchor="middle" class="benchmark-result-title">Compliance</text>

                                <g class="benchmark-check-row row-sf">
                                    <circle cx="116" cy="70" r="10" class="benchmark-check-circle"></circle>
                                    <path d="M111 70 L115 74 L122 65" class="benchmark-check-mark"></path>
                                    <text x="132" y="74" class="benchmark-result-text">SF EBO</text>
                                </g>

                                <g class="benchmark-check-row row-ab">
                                    <circle cx="116" cy="96" r="10" class="benchmark-check-circle"></circle>
                                    <path d="M111 96 L115 100 L122 91" class="benchmark-check-mark"></path>
                                    <text x="132" y="100" class="benchmark-result-text">AB 802</text>
                                </g>

                                <g class="benchmark-ribbon">
                                    <circle cx="214" cy="111" r="18" class="benchmark-ribbon-medal"></circle>
                                    <circle cx="214" cy="111" r="11" class="benchmark-ribbon-medal-inner"></circle>
                                    <path d="M203 126 L196 144 L210 136 L214 150 L220 136 L233 144 L225 126 Z" class="benchmark-ribbon-tail tail-left"></path>
                                    <path d="M225 126 L233 144 L220 136 L214 150 L210 136 L196 144 L203 126 Z" class="benchmark-ribbon-tail tail-right"></path>
                                    <text x="214" y="114" text-anchor="middle" class="benchmark-ribbon-text">COMPLIED</text>
                                </g>
                            </g>
                        </svg>
                    </span>
                `;
            case 'retrofit-bulb':
                return `
                    <span class="services-fresh-card-visual retrofit-bulb-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="retrofit-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff1da"></stop>
                                    <stop offset="100%" stop-color="#f6b56f"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-old-bulb" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#d2b186"></stop>
                                    <stop offset="100%" stop-color="#9d7449"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-led-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fffbe6"></stop>
                                    <stop offset="100%" stop-color="#fff09d"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-led-body" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fefefe"></stop>
                                    <stop offset="100%" stop-color="#e9eef1"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#retrofit-bg)"></rect>
                            <ellipse cx="160" cy="144" rx="98" ry="18" fill="rgba(164, 89, 27, 0.14)"></ellipse>

                            <g class="retrofit-backdrop-bulbs">
                                <g class="retrofit-backdrop-bulb bulb-left-top">
                                    <ellipse cx="76" cy="58" rx="18" ry="22" class="retrofit-backdrop-glow"></ellipse>
                                    <path d="M62 48 C62 39 68 32 76 32 C84 32 90 39 90 48 L90 61 C90 69 84 75 76 75 C68 75 62 69 62 61 Z" class="retrofit-backdrop-body"></path>
                                    <rect x="68" y="74" width="16" height="12" rx="5" class="retrofit-backdrop-base"></rect>
                                </g>
                                <g class="retrofit-backdrop-bulb bulb-right-top">
                                    <ellipse cx="244" cy="58" rx="18" ry="22" class="retrofit-backdrop-glow"></ellipse>
                                    <path d="M230 48 C230 39 236 32 244 32 C252 32 258 39 258 48 L258 61 C258 69 252 75 244 75 C236 75 230 69 230 61 Z" class="retrofit-backdrop-body"></path>
                                    <rect x="236" y="74" width="16" height="12" rx="5" class="retrofit-backdrop-base"></rect>
                                </g>
                                <g class="retrofit-backdrop-bulb bulb-left-bottom">
                                    <ellipse cx="96" cy="112" rx="18" ry="22" class="retrofit-backdrop-glow"></ellipse>
                                    <path d="M82 102 C82 93 88 86 96 86 C104 86 110 93 110 102 L110 115 C110 123 104 129 96 129 C88 129 82 123 82 115 Z" class="retrofit-backdrop-body"></path>
                                    <rect x="88" y="128" width="16" height="12" rx="5" class="retrofit-backdrop-base"></rect>
                                </g>
                                <g class="retrofit-backdrop-bulb bulb-right-bottom">
                                    <ellipse cx="224" cy="112" rx="18" ry="22" class="retrofit-backdrop-glow"></ellipse>
                                    <path d="M210 102 C210 93 216 86 224 86 C232 86 238 93 238 102 L238 115 C238 123 232 129 224 129 C216 129 210 123 210 115 Z" class="retrofit-backdrop-body"></path>
                                    <rect x="216" y="128" width="16" height="12" rx="5" class="retrofit-backdrop-base"></rect>
                                </g>
                            </g>

                            <g class="retrofit-old-bulb">
                                <path d="M160 40 C133 40 116 58 116 84 C116 102 126 114 140 120 L180 120 C194 114 204 102 204 84 C204 58 187 40 160 40 Z" fill="url(#retrofit-old-bulb)"></path>
                                <rect x="143" y="112" width="34" height="20" rx="8" fill="#8b8f95"></rect>
                                <rect x="146" y="118" width="28" height="4" rx="2" fill="#6f757c"></rect>
                                <rect x="146" y="125" width="28" height="4" rx="2" fill="#6f757c"></rect>
                                <path d="M148 64 C154 74 166 74 172 84 C176 92 171 102 160 108" fill="none" stroke="rgba(90, 55, 22, 0.45)" stroke-width="4" stroke-linecap="round"></path>
                            </g>

                            <g class="retrofit-led-bulb">
                                <ellipse cx="160" cy="78" rx="36" ry="42" fill="url(#retrofit-led-glow)" class="retrofit-led-halo"></ellipse>
                                <path d="M136 54 C136 42 146 34 160 34 C174 34 184 42 184 54 L184 78 C184 90 174 98 160 98 C146 98 136 90 136 78 Z" fill="url(#retrofit-led-body)"></path>
                                <rect x="144" y="96" width="32" height="22" rx="8" fill="#c2c8cf"></rect>
                                <rect x="147" y="101" width="26" height="4" rx="2" fill="#8f98a2"></rect>
                                <rect x="147" y="108" width="26" height="4" rx="2" fill="#8f98a2"></rect>
                                <rect x="149" y="49" width="22" height="24" rx="10" fill="rgba(255, 244, 177, 0.92)"></rect>
                                <path d="M149 82 L171 82" stroke="#d3d9de" stroke-width="4" stroke-linecap="round"></path>
                            </g>

                            <g class="retrofit-swap-arcs">
                                <path d="M108 74 C108 48 132 28 160 28" class="retrofit-arc arc-left"></path>
                                <path d="M212 74 C212 48 188 28 160 28" class="retrofit-arc arc-right"></path>
                            </g>

                            <g class="retrofit-led-rays">
                                <rect x="158" y="18" width="4" height="14" rx="2" class="retrofit-ray ray-a"></rect>
                                <rect x="125" y="30" width="4" height="14" rx="2" transform="rotate(-32 127 37)" class="retrofit-ray ray-b"></rect>
                                <rect x="191" y="30" width="4" height="14" rx="2" transform="rotate(32 193 37)" class="retrofit-ray ray-c"></rect>
                                <rect x="112" y="68" width="4" height="14" rx="2" transform="rotate(-78 114 75)" class="retrofit-ray ray-d"></rect>
                                <rect x="206" y="68" width="4" height="14" rx="2" transform="rotate(78 208 75)" class="retrofit-ray ray-e"></rect>
                            </g>
                        </svg>
                    </span>
                `;
            case 'hoa-catch':
                return `
                    <span class="services-fresh-card-visual hoa-catch-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="hoa-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#eef6f2"></stop>
                                    <stop offset="100%" stop-color="#dbe9e1"></stop>
                                </linearGradient>
                                <linearGradient id="hoa-building" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#567567"></stop>
                                    <stop offset="100%" stop-color="#2f4f43"></stop>
                                </linearGradient>
                                <linearGradient id="hoa-window" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff7bf"></stop>
                                    <stop offset="100%" stop-color="#f0cf61"></stop>
                                </linearGradient>
                                <linearGradient id="hoa-coin" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff5aa"></stop>
                                    <stop offset="100%" stop-color="#e7bf46"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#hoa-bg)"></rect>
                            <ellipse cx="162" cy="144" rx="102" ry="18" fill="rgba(47, 102, 88, 0.12)"></ellipse>

                            <g class="hoa-catch-building">
                                <rect x="24" y="16" width="100" height="122" rx="14" fill="url(#hoa-building)"></rect>
                                <rect x="38" y="32" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="60" y="32" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="82" y="32" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="38" y="56" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="60" y="56" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="82" y="56" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="38" y="80" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="60" y="80" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="82" y="80" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="38" y="104" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="60" y="104" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="82" y="104" width="14" height="16" rx="3" fill="url(#hoa-window)"></rect>
                                <rect x="54" y="110" width="24" height="28" rx="5" fill="rgba(233, 240, 237, 0.42)"></rect>
                            </g>

                            <g class="hoa-catch-coins">
                                <g class="hoa-catch-coin coin-a">
                                    <circle cx="130" cy="48" r="14" fill="url(#hoa-coin)"></circle>
                                    <text x="130" y="53" text-anchor="middle">$</text>
                                </g>
                                <g class="hoa-catch-coin coin-b">
                                    <circle cx="146" cy="70" r="13" fill="url(#hoa-coin)"></circle>
                                    <text x="146" y="75" text-anchor="middle">$</text>
                                </g>
                                <g class="hoa-catch-coin coin-c">
                                    <circle cx="132" cy="94" r="13" fill="url(#hoa-coin)"></circle>
                                    <text x="132" y="99" text-anchor="middle">$</text>
                                </g>
                            </g>

                            <g class="hoa-catch-net">
                                <path d="M178 58 C198 42 226 42 246 58 C252 64 252 82 246 94 C228 106 198 106 180 94 C172 82 172 66 178 58 Z" fill="rgba(255,255,255,0.12)" stroke="#4e6d61" stroke-width="4"></path>
                                <path d="M186 62 L242 92" stroke="rgba(255,255,255,0.66)" stroke-width="2"></path>
                                <path d="M194 52 L248 80" stroke="rgba(255,255,255,0.66)" stroke-width="2"></path>
                                <path d="M180 74 L234 104" stroke="rgba(255,255,255,0.66)" stroke-width="2"></path>
                                <path d="M194 48 L184 96" stroke="rgba(255,255,255,0.5)" stroke-width="2"></path>
                                <path d="M212 46 L208 100" stroke="rgba(255,255,255,0.5)" stroke-width="2"></path>
                                <path d="M230 50 L230 102" stroke="rgba(255,255,255,0.5)" stroke-width="2"></path>
                                <path d="M246 88 L288 152" stroke="#7d9568" stroke-width="9" stroke-linecap="round"></path>
                                <circle cx="246" cy="88" r="6" fill="#7d9568"></circle>
                            </g>

                            <g class="hoa-catch-celebration">
                                <text x="206" y="52" text-anchor="middle" class="hoa-celebrate-emoji emoji-main">🥳</text>
                                <rect x="174" y="20" width="6" height="12" rx="3" class="hoa-confetti-drop confetti-1"></rect>
                                <rect x="188" y="26" width="6" height="12" rx="3" class="hoa-confetti-drop confetti-2"></rect>
                                <rect x="206" y="18" width="6" height="12" rx="3" class="hoa-confetti-drop confetti-3"></rect>
                                <rect x="224" y="24" width="6" height="12" rx="3" class="hoa-confetti-drop confetti-4"></rect>
                                <rect x="238" y="20" width="6" height="12" rx="3" class="hoa-confetti-drop confetti-5"></rect>
                            </g>
                        </svg>
                    </span>
                `;
            case 'retrofit-balance':
                return `
                    <span class="services-fresh-card-visual retrofit-balance-scene" aria-hidden="true">
                        <svg viewBox="0 0 320 180" role="presentation" focusable="false">
                            <defs>
                                <linearGradient id="retrofit-balance-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fff1e5"></stop>
                                    <stop offset="100%" stop-color="#f4ddd1"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-balance-old-bulb" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#d0ad82"></stop>
                                    <stop offset="100%" stop-color="#996a40"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-balance-led" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#fffdf6"></stop>
                                    <stop offset="100%" stop-color="#e7ecef"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-balance-old-heater" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#665d53"></stop>
                                    <stop offset="100%" stop-color="#433a32"></stop>
                                </linearGradient>
                                <linearGradient id="retrofit-balance-new-heater" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#c4ccd2"></stop>
                                    <stop offset="100%" stop-color="#97a3ac"></stop>
                                </linearGradient>
                            </defs>

                            <rect x="10" y="10" width="300" height="160" rx="24" fill="url(#retrofit-balance-bg)"></rect>
                            <ellipse cx="160" cy="146" rx="96" ry="18" fill="rgba(133, 79, 36, 0.12)"></ellipse>

                            <g class="retrofit-balance-scale">
                                <rect x="154" y="54" width="12" height="70" rx="6" class="retrofit-balance-post"></rect>
                                <rect x="130" y="120" width="60" height="12" rx="6" class="retrofit-balance-base"></rect>
                                <g class="retrofit-balance-beam">
                                    <rect x="82" y="56" width="156" height="10" rx="5" class="retrofit-balance-bar"></rect>
                                    <path d="M104 62 L98 98" class="retrofit-balance-string"></path>
                                    <path d="M136 62 L142 98" class="retrofit-balance-string"></path>
                                    <path d="M184 62 L178 98" class="retrofit-balance-string"></path>
                                    <path d="M216 62 L222 98" class="retrofit-balance-string"></path>
                                    <ellipse cx="120" cy="102" rx="34" ry="8" class="retrofit-balance-pan"></ellipse>
                                    <ellipse cx="200" cy="102" rx="34" ry="8" class="retrofit-balance-pan"></ellipse>
                                    <g class="retrofit-balance-device old-bulb-device">
                                        <ellipse cx="120" cy="76" rx="15" ry="18" fill="rgba(255, 219, 142, 0.18)"></ellipse>
                                        <path d="M120 62 C108 62 100 72 100 84 C100 94 106 100 114 104 L126 104 C134 100 140 94 140 84 C140 72 132 62 120 62 Z" fill="url(#retrofit-balance-old-bulb)"></path>
                                        <path d="M113 84 C116 78 124 78 127 84 C128 87 126 91 120 95" fill="none" stroke="rgba(89, 56, 28, 0.58)" stroke-width="3" stroke-linecap="round"></path>
                                        <rect x="112" y="101" width="16" height="10" rx="4" fill="#8d8f94"></rect>
                                    </g>

                                    <g class="retrofit-balance-device led-device">
                                        <ellipse cx="120" cy="76" rx="18" ry="20" fill="rgba(255, 241, 154, 0.26)"></ellipse>
                                        <path d="M102 68 C102 58 110 52 120 52 C130 52 138 58 138 68 L138 84 C138 94 130 100 120 100 C110 100 102 94 102 84 Z" fill="url(#retrofit-balance-led)"></path>
                                        <rect x="108" y="98" width="24" height="14" rx="6" fill="#c4cbd0"></rect>
                                        <rect x="112" y="66" width="16" height="18" rx="8" fill="rgba(255, 238, 133, 0.9)"></rect>
                                    </g>

                                    <g class="retrofit-balance-device old-heater-device">
                                        <rect x="108" y="66" width="24" height="36" rx="10" fill="url(#retrofit-balance-old-heater)"></rect>
                                        <path d="M120 74 C114 82 115 92 120 96 C125 92 126 82 120 74 Z" fill="#ff8f45"></path>
                                        <path d="M120 60 L120 48" stroke="#7d6f60" stroke-width="5" stroke-linecap="round"></path>
                                    </g>

                                    <g class="retrofit-balance-device new-heater-device">
                                        <ellipse cx="120" cy="70" rx="14" ry="6" fill="#cad2d7"></ellipse>
                                        <rect x="106" y="70" width="28" height="34" rx="12" fill="url(#retrofit-balance-new-heater)"></rect>
                                        <ellipse cx="120" cy="104" rx="14" ry="6" fill="#aab4bc"></ellipse>
                                        <polygon points="120,76 114,86 121,86 116,96 128,82 121,82" fill="#6aa7d5"></polygon>
                                    </g>

                                    <text x="178" y="99" class="retrofit-balance-dollar red ob-dollar-1">$</text>
                                    <text x="200" y="99" class="retrofit-balance-dollar red ob-dollar-2">$</text>
                                    <text x="222" y="99" class="retrofit-balance-dollar red ob-dollar-3">$</text>

                                    <text x="200" y="101" class="retrofit-balance-dollar green led-dollar-1">$</text>

                                    <text x="170" y="97" class="retrofit-balance-dollar red oh-dollar-1">$</text>
                                    <text x="190" y="97" class="retrofit-balance-dollar red oh-dollar-2">$</text>
                                    <text x="210" y="97" class="retrofit-balance-dollar red oh-dollar-3">$</text>
                                    <text x="230" y="97" class="retrofit-balance-dollar red oh-dollar-4">$</text>

                                    <text x="190" y="100" class="retrofit-balance-dollar green nh-dollar-1">$</text>
                                    <text x="210" y="100" class="retrofit-balance-dollar green nh-dollar-2">$</text>
                                </g>
                            </g>
                        </svg>
                    </span>
                `;
            default:
                return '';
        }
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
