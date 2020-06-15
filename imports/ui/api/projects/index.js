import { Meteor } from "meteor/meteor";

export default {
  findUsers: (params) => new Promise((resolve, reject) => {
    Meteor.call(
      "projects.findUsers",
      params,
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  })
};
