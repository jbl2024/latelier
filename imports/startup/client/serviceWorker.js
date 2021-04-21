/* eslint-disable */
import { Meteor } from "meteor/meteor";

Meteor.startup(() => {
  navigator.serviceWorker
    .register("/sw.js")
    .catch((error) => {
      console.log("ServiceWorker registration failed: ", error);
    });
});
