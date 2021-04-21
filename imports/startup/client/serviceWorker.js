/* eslint-disable */
import { Meteor } from "meteor/meteor";

Meteor.startup(() => {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.info("service worker registered"))
    .catch((error) => {
      console.log("ServiceWorker registration failed: ", error);
    });
});
