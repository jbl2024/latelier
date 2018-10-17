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
  forbidClientAccountCreation : true
});

// Libs
import { Meteor } from 'meteor/meteor';
import Vue from 'vue';
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import VueMeteorTracker from "vue-meteor-tracker";
Vue.use(VueMeteorTracker);

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here
Vue.use(VueMaterial);

import VueDragDrop from 'vue-drag-drop';
Vue.use(VueDragDrop);

import VueEvents from 'vue-event-handler'
Vue.use(VueEvents);

// Element UI
import ElementUI from 'element-ui'
Vue.use(ElementUI)

// Vuetify
import Vuetify from 'vuetify'
Vue.use(Vuetify)

import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

Vue.use(require('vue-shortkey'), { prevent: ['input', 'textarea'] })

// Main app
import App from '/imports/ui/App.vue';
import {store} from '/imports/store';
import routes from '/imports/routes.js'

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

  new Vue({
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
