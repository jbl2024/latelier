import { Meteor } from "meteor/meteor";

export default {
  call: (methodName, params = null) => new Promise((resolve, reject) => {
    Meteor.call(
      methodName,
      params,
      (error, datas) => {
        resolve(datas);
        if (error) {
          reject(error);
        }
      }
    );
  })
};
