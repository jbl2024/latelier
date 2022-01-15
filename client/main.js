import { Meteor } from "meteor/meteor";
import "/imports/startup/client/serviceWorker.js";
// Libs
import Vue from "vue";
import VueRouter from "vue-router";

import VueMeteorTracker from "vue-meteor-tracker";
import VueEvents from "vue-event-handler";
import VueObserveVisibility from "vue-observe-visibility";
import vClickOutside from "v-click-outside";

// Vuetify
import Vuetify from "vuetify";

import "vuetify/dist/vuetify.min.css";

import "pretty-checkbox/dist/pretty-checkbox.min.css";

// Main app
import App from "/imports/ui/App.vue";
import store from "/imports/store/store";
import routes from "/imports/routes";
import "/imports/favicon";
import i18n from "/imports/i18n/";

import confirm from "/imports/confirm/confirm";

// Matomo Tracker
import VueMatomo from "vue-matomo";

require("intersection-observer");

if (Meteor.settings.public.devServerURL) {
  // HMR url for iOS
  /* eslint no-undef: "off" */
  __meteor_runtime_config__.VUE_DEV_SERVER_URL = Meteor.settings.public.devServerURL;
}

Meteor.startup(() => {
  setTimeout(() => {
    const elem = document.getElementById("inject-loader-wrapper");
    if (elem) {
      elem.remove();
    }
  }, 500);
});

Accounts.config({
  forbidClientAccountCreation: true,
  sendVerificationEmail: Meteor.settings.public.emailVerificationNeeded
});

/* eslint no-underscore-dangle: "off" */
delete Accounts._accountsCallbacks["verify-email"];
Accounts.onEmailVerificationLink(function(token, done) {
  Accounts.verifyEmail(token, (err) => {
    if (err) {
      /* eslint no-console:off */
      console.log("Error: ", err);
    } else {
      /* eslint no-console:off */
      console.log("Success");
      // Do whatever you want to on completion, the
      // done() call is the default one.
      done();
    }
  });
});

Vue.use(VueRouter);
Vue.use(VueMeteorTracker);
Vue.use(VueEvents);
Vue.use(Vuetify);
Vue.use(VueObserveVisibility);
Vue.use(vClickOutside);

const vuetify = new Vuetify({
  icons: {
    iconfont: "mdi"
  },
  theme: {
    themes: {
      light: {
        primary: "#363636",
        accent: "#F9A825"
      }
    }
  }
});

Vue.use(require("vue-shortkey"), {
  prevent: [
    "input",
    "textarea",
    ".ProseMirror",
    ".djs-direct-editing-content"]
});

Vue.use(confirm, { vuetify });

Meteor.startup(() => {
  // Time of inactivity to set user as away automaticly. Default 60000
  UserPresence.awayTime = 60000;
  // Set user as away when window loses focus. Defaults false
  UserPresence.awayOnWindowBlur = false;
  // Start monitor for user activity
  UserPresence.start();

  Vue.directive("focus", {
    inserted: (el) => {
      setTimeout(() => {
        el.focus();
      }, 500);
    }
  });
  const router = new VueRouter({
    mode: "history",
    base: new URL(Meteor.absoluteUrl()).pathname,
    routes
  });

  // Matomo Tracker
  if (Meteor.settings.public?.tracking?.matomo?.enabled === true) {
    Vue.use(VueMatomo, { router, ...Meteor.settings.public?.tracking?.matomo });
  }

  new Vue({
    i18n,
    router,
    store,
    vuetify,
    render: (h) => h(App)
  }).$mount("app");

  Vue.prototype.$log = window.console.log;
  Vue.prototype.$notifyError = function (error) {
    store.dispatch("notifyError", error);
  };

  Vue.prototype.$notify = function (message) {
    store.dispatch("notify", message);
  };
});
