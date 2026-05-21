(function setupCrossSiteNavigation() {
    const PROD_APP_ORIGIN = 'https://app.cohi.energy';
    const RETURNING_USER_COOKIE = 'cohi_returning_user';
    const LOCAL_PORT_PAIRS = {
        '8000': '5173',
        '8001': '5174',
        '5173': '8000',
        '5174': '8001',
    };

    function isLocalHost(hostname) {
        return hostname === 'localhost' || hostname === '127.0.0.1';
    }

    function normalizeOrigin(value, baseOrigin) {
        if (!value) {
            return null;
        }

        try {
            return new URL(value, baseOrigin).origin;
        } catch {
            return null;
        }
    }

    function getConfiguredAppOrigin() {
        if (typeof APP_BASE_URL === 'undefined') {
            return null;
        }

        return normalizeOrigin(APP_BASE_URL, window.location.origin);
    }

    function resolveAppOrigin() {
        const configuredOrigin = getConfiguredAppOrigin();
        if (configuredOrigin) {
            return configuredOrigin;
        }

        if (window.location.hostname === 'cohi.energy') {
            return PROD_APP_ORIGIN;
        }

        if (window.location.hostname === 'app.cohi.energy') {
            return window.location.origin;
        }

        if (isLocalHost(window.location.hostname)) {
            const pairedPort = LOCAL_PORT_PAIRS[window.location.port];
            if (pairedPort) {
                return `${window.location.protocol}//${window.location.hostname}:${pairedPort}`;
            }

            return `${window.location.protocol}//${window.location.hostname}:5173`;
        }

        return PROD_APP_ORIGIN;
    }

    function buildAppUrl(pathname) {
        return new URL(pathname || '/', resolveAppOrigin()).toString();
    }

    function buildMarketingUrl(pathname) {
        return new URL(pathname || '/', window.location.origin).toString();
    }

    function hasReturningUserCookie() {
        return document.cookie
            .split(';')
            .some((cookie) => cookie.trim() === `${RETURNING_USER_COOKIE}=1`);
    }

    async function isCurrentUserAuthenticated() {
        try {
            const response = await fetch(buildAppUrl('/api/auth/me'), {
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) {
                return false;
            }

            const user = await response.json();
            return user && user.authenticated === true;
        } catch {
            return false;
        }
    }

    function updateAuthAwareHomeLinks(isAuthenticated) {
        document.querySelectorAll('[data-auth-aware-home-link]').forEach((link) => {
            link.setAttribute(
                'href',
                isAuthenticated ? buildAppUrl('/app') : buildMarketingUrl('/'),
            );
        });
    }

    function updateAccountEntryLinks(isAuthenticated) {
        let pathname = '/register';
        if (isAuthenticated) {
            pathname = '/app';
        } else if (hasReturningUserCookie()) {
            pathname = '/login';
        }

        document.querySelectorAll('[data-account-entry-link]').forEach((link) => {
            link.setAttribute('href', buildAppUrl(pathname));
        });
    }

    window.cohiNavigation = {
        resolveAppOrigin,
        buildAppUrl,
    };

    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-app-link]').forEach((link) => {
            const pathname = link.getAttribute('data-app-path') || '/';
            link.setAttribute('href', buildAppUrl(pathname));
        });

        updateAuthAwareHomeLinks(false);
        updateAccountEntryLinks(false);
        void isCurrentUserAuthenticated().then((isAuthenticated) => {
            updateAuthAwareHomeLinks(isAuthenticated);
            updateAccountEntryLinks(isAuthenticated);
        });
    });
})();
