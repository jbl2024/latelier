import { Meteor } from "meteor/meteor";
import Vue from "vue";

export default {
  call: (methodName, params = null) => new Promise((resolve, reject) => {
    Meteor.call(
      methodName,
      params,
      (error, datas) => {
        if (error) {
          Vue.prototype.$notifyError(error);
          reject(error);
        }
        resolve(datas);
      }
    );
  })
};
