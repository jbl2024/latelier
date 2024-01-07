import { Meteor } from "meteor/meteor";

export const projectHasFeature = (feature) => async (to, from, next) => {
  const { projectId } = to.params;
  try {
    const result = await Meteor.callAsync("projects.hasFeature", { projectId, feature });
    if (!result) {
      next({
        name: "project-dashboard",
        params: { projectId }
      });
    } else {
      next();
    }
  } catch (error) {
    next({
      name: "project-dashboard",
      params: { projectId }
    });
  }
};

export const organizationHasFeature = (feature) => async (to, from, next) => {
  const { organizationId } = to.params;
  try {
    let features = await Meteor.callAsync("organizations.getFeatures", { organizationId });
    if (!Array.isArray(features)) {
      features = [];
    }
    if (!features.includes(feature)) {
      next({
        name: "dashboard-organization-page",
        params: { organizationId }
      });
    } else {
      next();
    }
  } catch (error) {
    next({
      name: "dashboard-organization-page",
      params: { organizationId }
    });
  }
};
