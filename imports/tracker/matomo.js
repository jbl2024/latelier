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
          _paq.push(['setTrackerUrl', `${config.url}matomo.php`]);
          _paq.push(['setSiteId', config.siteId]);
          const script = document.createElement('script');
          Object.assign(script, {
            id: 'matomo-tracker',
            type: 'text/javascript',
            async: 'true',
            defer: 'true',
            src: `${config.url}matomo.js`,
          });
          const s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(script, s);
        })();
    },
    event(category, action, name, value) {
        const _tracker = this;
        setTimeout(function () {
            if (!window.Matomo) return;
            var tracker = Matomo.getAsyncTracker(`${_tracker.config.url}matomo.php`, _tracker.config.siteId);
            tracker.trackEvent(category, action, name, value);
        }, 0);
    },
    search(keyword) {
        const _tracker = this;
        setTimeout(() => {
            if (!window.Matomo) return;
            var tracker = Matomo.getAsyncTracker(`${_tracker.config.url}matomo.php`, _tracker.config.siteId);
            tracker.trackSiteSearch(keyword);
        }, 0);
    }
}
