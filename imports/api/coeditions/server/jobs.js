import { Meteor } from "meteor/meteor";
import { Jobs } from "meteor/msavin:sjobs";

import moment from "moment";

Jobs.register({
  async removeOutdatedCoeditions() {
    const instance = this;
    const deleteDate = moment()
      .startOf("day")
      .add(-1 * (Meteor.settings.coedition?.daysToKeep || 3), "days")
      .toDate();

    await Meteor.callAsync("coeditions.removeOutdated", { when: deleteDate });

    instance.replicate({
      date: moment()
        .add(1, "days")
        .startOf("day")
        .add(5, "hours")
        .toDate()
    });
    instance.success();
  }
});

const when = moment()
  .startOf("day")
  .add(5, "hours");

Meteor.startup(function () {
  Jobs.run("removeOutdatedCoeditions", {
    date: when.toDate(),
    singular: true
  });
});
