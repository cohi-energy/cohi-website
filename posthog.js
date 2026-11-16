// PostHog Analytics Tracking
// Provides cross-subdomain tracking between cohi.energy and app.cohi.energy.

// Load PostHog script asynchronously and queue the methods this static site uses.
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

// Only the production site loads PostHog. The free plan has a single project,
// so a local or preview build would otherwise write into production data; set
// POSTHOG_DEV_ENABLED = true in a local config.js to opt in.
var COHI_POSTHOG_HOSTS = ['cohi.energy', 'www.cohi.energy'];
var INTERNAL_ANALYTICS_COOKIE = 'internal_analytics_device_v1';
var cohiPostHogStarted = false;

function hasCookie(name) {
    return String(document.cookie || '')
        .split(';')
        .map(function (cookie) { return cookie.trim(); })
        .indexOf(name + '=1') !== -1;
}

function hasInternalAnalyticsCookie() {
    return hasCookie(INTERNAL_ANALYTICS_COOKIE);
}

// The browser's own Do Not Track or Global Privacy Control is the only switch,
// as in the app: a browser sending either loads no analytics at all, and it
// covers that browser only. GPC is the opt-out signal California's CCPA
// regulations require honouring. Current posthog-js counts both under
// respect_dnt, but the site does not rely on the version the CDN serves.
function cohiBrowserSendsPrivacySignal() {
    if (typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true) {
        return true;
    }
    var dnt = [
        typeof navigator !== 'undefined' ? navigator.doNotTrack : null,
        typeof window !== 'undefined' ? window.doNotTrack : null
    ];
    return dnt.indexOf('1') !== -1 || dnt.indexOf('yes') !== -1;
}

(function initPostHog() {
    var configured = typeof POSTHOG_API_KEY !== 'undefined' && POSTHOG_API_KEY && POSTHOG_API_KEY !== 'phc_xxxxx';
    var devEnabled = typeof POSTHOG_DEV_ENABLED !== 'undefined' && POSTHOG_DEV_ENABLED === true;
    if (!configured || (COHI_POSTHOG_HOSTS.indexOf(location.hostname) === -1 && !devEnabled)) {
        return;
    }
    if (cohiBrowserSendsPrivacySignal()) {
        return;
    }
    var host = typeof POSTHOG_HOST !== 'undefined' ? POSTHOG_HOST : 'https://us.i.posthog.com';

    posthog.init(POSTHOG_API_KEY, {
        api_host: host,
        defaults: '2026-01-30',

        cross_subdomain_cookie: true,
        capture_pageview: 'history_change',
        capture_pageleave: 'if_capture_pageview',
        autocapture: false,
        // Where visitors click, move the pointer and how far they scroll, for page design.
        capture_heatmaps: true,
        respect_dnt: true,
        persistence: 'localStorage+cookie',
        person_profiles: 'identified_only',
        mask_personal_data_properties: true,
        custom_personal_data_properties: ['email'],
        mask_all_text: true,
        mask_all_element_attributes: true,
        disable_session_recording: true,
        session_recording: { maskAllInputs: true, maskTextSelector: '*' },
        // A browser the app identified keeps that person's id here (the shared
        // cookie): one person per browser, so the visit links to them.
        loaded: function (ph) {
            ph.register({
                environment: COHI_POSTHOG_HOSTS.indexOf(location.hostname) === -1 ? 'development' : 'production'
            });
            // Set by the app's /internal/analytics/mark on .cohi.energy; once
            // /unmark has cleared it, the marker this site stored goes too.
            if (hasInternalAnalyticsCookie()) {
                ph.register({
                    is_internal_traffic: true,
                    internal_source: 'marked_device',
                    internal_marker_version: 1
                });
            } else {
                ph.unregister('is_internal_traffic');
                ph.unregister('internal_source');
                ph.unregister('internal_marker_version');
            }
        }
    });
    cohiPostHogStarted = true;
})();

// False when PostHog is not running here (Do Not Track or GPC among the
// reasons) or the visitor opted out: then no analytics call leaves the page.
function cohiAnalyticsAllowed() {
    if (!cohiPostHogStarted || cohiBrowserSendsPrivacySignal()) {
        return false;
    }
    try {
        return !(posthog.has_opted_out_capturing && posthog.has_opted_out_capturing());
    } catch {
        return false;
    }
}

var EMAIL_VALUE_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

function getPostHogDistinctId() {
    try {
        var distinctId = posthog && posthog.get_distinct_id ? posthog.get_distinct_id() : null;
        if (typeof distinctId !== 'string' || EMAIL_VALUE_RE.test(distinctId)) {
            return null;
        }
        return distinctId;
    } catch {
        return null;
    }
}

function getPostHogSessionId() {
    try {
        var sessionId = posthog && posthog.get_session_id ? posthog.get_session_id() : null;
        if (typeof sessionId !== 'string' || EMAIL_VALUE_RE.test(sessionId)) {
            return null;
        }
        return sessionId;
    } catch {
        return null;
    }
}

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
