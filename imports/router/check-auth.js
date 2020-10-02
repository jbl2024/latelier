import { Meteor } from "meteor/meteor";
import store from "/imports/store/store";
import Vue from "vue";

// Basic User
export const isBasicAuth = (to, from, next) => {
  Vue.prototype.$isLoggingIn = true;
  if (
    Meteor.settings.public
    && Meteor.settings.public.sso
    && Meteor.settings.public.sso.enabled
    && !Meteor.userId()
  ) {
    Meteor.call("users.ssoAuthenticate", (error, result) => {
      if (!error) {
        Meteor.loginWithToken(result.token, (err) => {
          if (!err) {
            Meteor.call("permissions.setAdminIfNeeded");
            Vue.prototype.$isLoggingIn = false;
            next();
          } else {
            Vue.prototype.$isLoggingIn = false;
            next({
              name: "login"
            });
            store.dispatch("notifyError", err);
          }
        });
      } else {
        Vue.prototype.$isLoggingIn = false;
        store.dispatch("notifyError", error);
        next({
          name: "login"
        });
      }
    });
    return;
  }

  Vue.prototype.$isLoggingIn = false;

  if (!Meteor.userId()) {
    next({
      name: "login"
    });
  } else {
    next();
  }
};

export const projectAuth = (to, from, next) => {
  const { projectId } = to.params;
  Meteor.call("permissions.canReadProject", { projectId }, (error, result) => {
    if (error || !result) {
      next({
        name: "forbidden"
      });
    } else {
      next();
    }
  });
};

export const meetingAuth = (to, from, next) => {
  const { meetingId } = to.params;
  Meteor.call("permissions.canReadMeeting", { meetingId }, (error, result) => {
    if (error || !result) {
      next({
        name: "forbidden"
      });
    } else {
      next();
    }
  });
};
