// Libs
import { Meteor } from 'meteor/meteor';
import Vue from 'vue'

import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here

Vue.use(VueMaterial)

// Main app
import App from '/imports/ui/App.vue';

Meteor.startup(() => {
  new Vue({
    el: '#app',
    ...App,
  });
});
