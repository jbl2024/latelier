import { Meteor } from "meteor/meteor";

export default {
  call: (methodName, params = null) => new Promise((resolve, reject) => {
    Meteor.call(
      methodName,
      params,
      (error, datas) => {
        if (error) {
          reject(error);
        }
        resolve(datas);
      }
    );
  })
};
