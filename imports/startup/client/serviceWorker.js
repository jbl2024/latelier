/* eslint-disable */
import { Meteor } from "meteor/meteor";

Meteor.startup(() => {
  if (!navigator.serviceWorker) {
    return;
  }
  navigator.serviceWorker
    .register("/sw.js")
    .catch((error) => {
      console.log("ServiceWorker registration failed: ", error);
    });
});
