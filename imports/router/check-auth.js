import { Meteor } from "meteor/meteor";
import store from "/imports/store/store";

// Basic User
export const isBasicAuth = (to, from, next) => {
  if (
    Meteor.settings.public
    && Meteor.settings.public.sso
    && Meteor.settings.public.sso.enabled
    && !Meteor.userId()
  ) {
    const email = headers.get(Meteor.settings.public.sso.email);
    if (!email) {
      next({
        name: "login"
      });
    } else {
      Meteor.call("users.ssoAuthenticate", (error, result) => {
        if (!error) {
          Meteor.loginWithToken(result.token, (err) => {
            if (!err) {
              next();
            } else {
              store.dispatch("notifyError", error);
            }
          });
        } else {
          store.dispatch("notifyError", error);
        }
      });
    }
    return;
  }

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
