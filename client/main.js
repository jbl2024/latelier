if (Meteor.settings.public.devServerURL) {
  // HMR url for iOS
  __meteor_runtime_config__.VUE_DEV_SERVER_URL = Meteor.settings.public.devServerURL;
}

Meteor.startup(function() {
    setTimeout(function() {
      var elem = document.getElementById("inject-loader-wrapper");
      elem.remove();      
    }, 500);
});

Accounts.config({
  forbidClientAccountCreation : false,
  sendVerificationEmail: true
});

delete Accounts._accountsCallbacks['verify-email'];
Accounts.onEmailVerificationLink(function(token,done) { 
  Accounts.verifyEmail(token, (err) => {
    if (err) {
        console.log("Error: ", err);
    } else {
        console.log("Success");
        // Do whatever you want to on completion, the
        // done() call is the default one.
        done();
    }
  });
});

// Libs
import { Meteor } from 'meteor/meteor';
import Vue from 'vue';
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import VueI18n from 'vue-i18n';
Vue.use(VueI18n)

import VueMeteorTracker from "vue-meteor-tracker";
Vue.use(VueMeteorTracker);

import VueDragDrop from 'vue-drag-drop';
Vue.use(VueDragDrop);

import VueEvents from 'vue-event-handler'
Vue.use(VueEvents);

import colors from 'vuetify/es5/util/colors'

// Vuetify
import Vuetify from 'vuetify'
Vue.use(Vuetify, {
  theme: {
    primary: "#455A64",
    accent: "#F9A825",
  }
});

import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

import 'pretty-checkbox/dist/pretty-checkbox.min.css'

Vue.use(require('vue-shortkey'), { prevent: ['input', 'textarea', '.ql-editor'] })

// Main app
import App from '/imports/ui/App.vue';
import {store} from '/imports/store';
import routes from '/imports/routes.js'
import messages from '/imports/i18n.js'

Meteor.startup(() => {
  // Time of inactivity to set user as away automaticly. Default 60000
  UserPresence.awayTime = 60000;
  // Set user as away when window loses focus. Defaults false
  UserPresence.awayOnWindowBlur = true;
  // Start monitor for user activity
  UserPresence.start();

  Vue.directive('focus', {
    inserted: (el) => {
      setTimeout(() => { el.focus(); }, 500);
    }
  })
  const router = new VueRouter({
    mode: 'history',
    routes,
  })

  let language = navigator.language;
  if (language.startsWith('en-')) {
    language = 'en';
  }
  
  const i18n = new VueI18n({
    locale: language,
    fallbackLocale: 'fr',
    silentTranslationWarn: true, 
    messages,
  })
  
  new Vue({
    i18n,
    router,
    store,
    render: h => h(App),
  }).$mount('app');


  Tracker.autorun(function(c) {
    var userId = Meteor.userId();
    if (c.firstRun)
      return;
    if (!userId) {
      router.push({ name: 'login' });
    }
  });  
});
