import Agent from "meteor/kschingiz:meteor-elastic-apm";

const { elasticApm } = Meteor.settings;
if (elasticApm && elasticApm.enabled) {
  Agent.start(elasticApm.options || {});
}
