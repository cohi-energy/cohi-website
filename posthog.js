// PostHog Analytics Tracking
// Provides cross-subdomain tracking between cohi.energy and app.cohi.energy

// Load PostHog script asynchronously
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

// Initialize PostHog with config values (if available)
(function initPostHog() {
    if (typeof POSTHOG_API_KEY !== 'undefined' && POSTHOG_API_KEY && POSTHOG_API_KEY !== 'phc_xxxxx') {
        var host = typeof POSTHOG_HOST !== 'undefined' ? POSTHOG_HOST : 'https://us.i.posthog.com';

        posthog.init(POSTHOG_API_KEY, {
            api_host: host,

            // CRITICAL: Enable cross-subdomain tracking for cohi.energy <-> app.cohi.energy
            cross_subdomain_cookie: true,

            // Capture pageviews automatically
            capture_pageview: true,

            // Track link clicks and button interactions
            autocapture: true,

            // Respect Do Not Track browser setting
            respect_dnt: true,

            // Persist across sessions
            persistence: 'localStorage+cookie'
        });
    }
})();

// Track CTA click events (for when app.cohi.energy links are added)
function trackCTAClick(destination, ctaLocation) {
    if (typeof posthog !== 'undefined' && posthog.capture) {
        try {
            posthog.capture('cta_clicked', {
                destination: destination || 'app.cohi.energy',
                cta_location: ctaLocation || 'unknown'
            });
        } catch (err) {
            console.warn('PostHog CTA tracking error:', err);
        }
    }
}

// Track custom events
function trackPostHogEvent(eventName, properties) {
    if (typeof posthog !== 'undefined' && posthog.capture) {
        try {
            posthog.capture(eventName, properties || {});
        } catch (err) {
            console.warn('PostHog event tracking error:', err);
        }
    }
}
