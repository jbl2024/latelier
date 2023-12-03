import { Meteor } from "meteor/meteor";
import store from "/imports/store/store";
import Vue from "vue";

// Basic User
export const isBasicAuth = async (to, from, next) => {
  Vue.prototype.$isLoggingIn = true;

  if (
    Meteor.settings.public
    && Meteor.settings.public.sso
    && Meteor.settings.public.sso.enabled
    && !Meteor.userId()
  ) {
    try {
      const result = await Meteor.callAsync("users.ssoAuthenticate");
      Meteor.loginWithToken(result.token, async (err) => {
        if (!err) {
          try {
            await Meteor.callAsync("permissions.setAdminIfNeeded");
            Vue.prototype.$isLoggingIn = false;
            next();
          } catch (adminError) {
            Vue.prototype.$isLoggingIn = false;
            store.dispatch("notifyError", adminError);
          }
        } else {
          Vue.prototype.$isLoggingIn = false;
          next({ name: "login" });
          store.dispatch("notifyError", err);
        }
      });
    } catch (error) {
      Vue.prototype.$isLoggingIn = false;
      store.dispatch("notifyError", error);
      next({ name: "login" });
    }
    return;
  }

  Vue.prototype.$isLoggingIn = false;

  if (!Meteor.userId()) {
    next({ name: "login" });
  } else {
    next();
  }
};

export const checkSsoAuth = async (to, from, next) => {
  Vue.prototype.$isLoggingIn = true;
  if (
    Meteor.settings.public
    && Meteor.settings.public.sso
    && Meteor.settings.public.sso.enabled
    && !Meteor.userId()
  ) {
    try {
      const result = await Meteor.callAsync("users.ssoAuthenticate");
      Meteor.loginWithToken(result.token, (err) => {
        Vue.prototype.$isLoggingIn = false;
        if (!err) {
          try {
            Meteor.callAsync("permissions.setAdminIfNeeded");
          } catch (adminError) {
            store.dispatch("notifyError", adminError);
          }
        } else {
          store.dispatch("notifyError", err);
        }
        next();
      });
    } catch (error) {
      Vue.prototype.$isLoggingIn = false;
      store.dispatch("notifyError", error);
      next();
    }
  } else {
    Vue.prototype.$isLoggingIn = false;
    next();
  }
};

export const projectAuth = async (to, from, next) => {
  const { projectId } = to.params;

  try {
    const result = await Meteor.callAsync("permissions.canReadProject", { projectId });
    if (!result) {
      next({ name: "forbidden" });
    } else {
      next();
    }
  } catch (error) {
    // Handle the error as needed, for instance, by redirecting to a 'forbidden' route
    next({ name: "forbidden" });
  }
};

export const meetingAuth = async (to, from, next) => {
  const { meetingId } = to.params;

  try {
    const result = await Meteor.callAsync("permissions.canReadMeeting", { meetingId });
    if (!result) {
      next({ name: "forbidden" });
    } else {
      next();
    }
  } catch (error) {
    // Handle the error as needed, for instance, by redirecting to a 'forbidden' route
    next({ name: "forbidden" });
  }
};
