import { Meteor } from "meteor/meteor";

// Not triggered when entering same route but different params
export const projectHasFeature = (feature) => (to, from, next) => {
  const { projectId } = to.params;
  Meteor.call("projects.hasFeature", { projectId, feature }, (error, result) => {
    if (error || !result) {
      next({
        name: "project-dashboard",
        params: { projectId }
      });
    } else {
      next();
    }
  });
};
