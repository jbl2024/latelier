// Libs
import { Meteor } from 'meteor/meteor';
import Vue from 'vue';
import routerFactory from '/imports/routes.js';

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here

import VueDragDrop from 'vue-drag-drop';
import VueEvents from 'vue-events'

Vue.use(VueEvents) ;
Vue.use(VueDragDrop);
Vue.use(VueMaterial);

// Element UI
import ElementUI from 'element-ui'
Vue.use(ElementUI)


// Main app
import App from '/imports/ui/App.vue';
import '/client/main.routes.js';

Meteor.startup(() => {
  const router = routerFactory.create();
  new Vue({
    router,
    render: h => h(App),
  }).$mount('app');
});
