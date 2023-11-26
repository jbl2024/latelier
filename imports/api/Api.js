import { Meteor } from "meteor/meteor";
import Vue from "vue";

export default {
  async call(...params) {
    const methodName = params.shift();
    try {
      const datas = await Meteor.applyAsync(methodName, params);
      return datas;
    } catch (error) {
      Vue.prototype.$notifyError(error);
      throw error;
    }
  }
};
