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

export const organizationHasFeature = (feature) => (to, from, next) => {
  const { organizationId } = to.params;
  Meteor.call("organizations.getFeatures", { organizationId }, (error, features) => {
    features = Array.isArray(features) ? features : [];
    if (error || !features.includes(feature)) {
      next({
        name: "dashboard-organization-page",
        params: { organizationId }
      });
    } else {
      next();
    }
  });
};
