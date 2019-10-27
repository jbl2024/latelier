import { Meteor } from "meteor/meteor";

// Libs
import Vue from "vue";
import VueRouter from "vue-router";

import VueI18n from "vue-i18n";

import VueMeteorTracker from "vue-meteor-tracker";

import VueEvents from "vue-event-handler";

import colors from "vuetify/es5/util/colors";

// Vuetify
import Vuetify from "vuetify";

import "vuetify/dist/vuetify.min.css";

import "pretty-checkbox/dist/pretty-checkbox.min.css";

// Main app
import App from "/imports/ui/App.vue";
import store from "/imports/store/store";
import routes from "/imports/routes";
import "/imports/favicon";
import messages from "/imports/i18n/i18n";

import confirm from "/imports/confirm/confirm";

if (Meteor.settings.public.devServerURL) {
  // HMR url for iOS
  /* eslint no-undef: "off" */
  __meteor_runtime_config__.VUE_DEV_SERVER_URL = Meteor.settings.public.devServerURL;
}

Meteor.startup(() => {
  setTimeout(() => {
    const elem = document.getElementById("inject-loader-wrapper");
    elem.remove();
  }, 500);
});

Accounts.config({
  forbidClientAccountCreation: false,
  sendVerificationEmail: true
});

/* eslint no-underscore-dangle: "off" */
delete Accounts._accountsCallbacks["verify-email"];
Accounts.onEmailVerificationLink((token, done) => {
  /* eslint no-unused-vars: off */
  /* eslint no-shadow: off */
  Accounts.verifyEmail((token, err) => {
    done();
  });
});

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(VueMeteorTracker);
Vue.use(VueEvents);
Vue.use(Vuetify);

const vuetify = new Vuetify({
  icons: {
    iconfont: "mdi"
  },
  theme: {
    themes: {
      light: {
        primary: "#455A64",
        accent: "#F9A825"
      }
    }
  }
});

Vue.use(require("vue-shortkey"), {
  prevent: ["input", "textarea", ".ql-editor"]
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

  let { language } = navigator;
  if (language.startsWith("en-")) {
    language = "en";
  }

  const i18n = new VueI18n({
    locale: language,
    fallbackLocale: "fr",
    silentTranslationWarn: true,
    messages
  });

  new Vue({
    i18n,
    router,
    store,
    vuetify,
    render: (h) => h(App)
  }).$mount("app");

  Tracker.autorun((c) => {
    const userId = Meteor.userId();
    if (c.firstRun) return;
    if (!userId) {
      router.push({ name: "login" });
    }
  });
});
