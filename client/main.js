if (Meteor.settings.public.devServerURL) {
  // HMR url for iOS
  __meteor_runtime_config__.VUE_DEV_SERVER_URL = Meteor.settings.public.devServerURL;
}

// Libs
import { Meteor } from 'meteor/meteor';
import Vue from 'vue';
import routerFactory from '/imports/routes.js';

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

// Main app
import App from '/imports/ui/App.vue';
import '/client/main.routes.js';
import {store} from '/imports/store';


Meteor.startup(() => {
  // Time of inactivity to set user as away automaticly. Default 60000
  UserPresence.awayTime = 60000;
  // Set user as away when window loses focus. Defaults false
  UserPresence.awayOnWindowBlur = true;
  // Start monitor for user activity
  UserPresence.start();

  const router = routerFactory.create();
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
