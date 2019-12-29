import { Meteor } from "meteor/meteor";
import { Activities } from "/imports/api/workshops/activities/activities";
import { Sessions } from "/imports/api/workshops/sessions/sessions";
import { Projects } from "/imports/api/projects/projects";
import { Tracks } from "../tracks";
import {
  checkCanWriteProject
} from "/imports/api/permissions/permissions";

Tracks.methods.create = new ValidatedMethod({
  name: "workshops.tracks.create",
  validate: new SimpleSchema({
    activityId: { type: String },
    sessionId: { type: String },
  }).validator(),
  run({ activityId, sessionId }) {

    const session = Sessions.findOne({ _id: sessionId });
    if (!session) {
      throw new Meteor.Error("not-found");
    }
    const project = Projects.findOne({ _id: session.projectId });
    if (!project) {
      throw new Meteor.Error("not-found");
    }

    const activity = Activities.findOne({ _id: activityId });
    if (!activity) {
      throw new Meteor.Error("not-found");
    }

    checkCanWriteProject(project._id);

    const _findLastOrder = function() {
      const track = Tracks.findOne({ sessionId: sessionId }, { sort: { order: -1 } });
      if (track) {
        return track.order;
      }
      return 0;
    };

    const date = new Date();

    const id = Tracks.insert({
      workshopId: session.workshopId,
      sessionId,
      activityId,
      name: activity.name,
      description: activity.description,
      order: _findLastOrder() + 1,
      createdAt: date,
      createdBy: Meteor.userId(),
      updatedAt: date,
      updatedBy: Meteor.userId()
    });
    return id;
  }
});
