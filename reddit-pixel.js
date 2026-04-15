// Reddit Pixel Tracking
// Initialize pixel - it will queue commands until pixel.js loads
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);

// Initialize pixel with ID from config (if available)
(function initRedditPixel() {
    if (typeof REDDIT_PIXEL_ID !== 'undefined' && REDDIT_PIXEL_ID) {
        rdt('init', REDDIT_PIXEL_ID);
        rdt('track', 'PageVisit');
    }
})();

// Track conversion event
function trackRedditConversion(eventType, conversionId) {
    if (typeof rdt !== 'undefined' && typeof REDDIT_PIXEL_ID !== 'undefined' && REDDIT_PIXEL_ID) {
        try {
            rdt('track', eventType, {
                conversionId: conversionId || 'contact_form_submission_' + Date.now()
            });
        } catch (err) {
            console.warn('Reddit pixel conversion tracking error:', err);
        }
    }
}

