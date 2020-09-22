// Matomo Tracker
export default {
    config: {},
    setConfig(config) {
        this.config = config;
        return this;
    },
    setup() {
        const config = this.config;
        window._paq = window._paq || [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          _paq.push(['setTrackerUrl', `${config.url}piwik.php`]);
          _paq.push(['setSiteId', config.siteId]);
          const script = document.createElement('script');
          Object.assign(script, {
            id: 'matomo-tracker',
            type: 'text/javascript',
            async: 'true',
            defer: 'true',
            src: `${config.url}piwik.js`,
          });
          const s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(script, s);
        })();
    },
    trackEvent(category, action, name, value) {
        const _tracker = this;
        setTimeout(function () {
            if (!Piwik) return;
            var tracker = Piwik.getAsyncTracker(_tracker.config.url, _tracker.config.siteId);
            tracker.trackEvent(category, action, name, value);
        }, 0);
    },
    trackSearch(keyword) {
        const _tracker = this;
        setTimeout(() => {
            if (!Piwik) return;
            var tracker = Piwik.getAsyncTracker(_tracker.config.url, _tracker.config.siteId);
            tracker.trackSiteSearch(keyword);
        }, 0);
    }
}