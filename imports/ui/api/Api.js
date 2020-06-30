import { Meteor } from "meteor/meteor";
import Vue from "vue";

export default {
  call(...params) {
    return new Promise((resolve, reject) => {
      const methodName = params.shift();
      Meteor.apply(
        methodName,
        params,
        null,
        (error, datas) => {
          if (error) {
            Vue.prototype.$notifyError(error);
            reject(error);
          }
          resolve(datas);
        }
      );
    });
  }
};
