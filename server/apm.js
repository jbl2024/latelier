import Agent from 'meteor/kschingiz:meteor-elastic-apm';

const elasticApm = Meteor.settings.elasticApm;
if (elasticApm && elasticApm.enabled) {
  Agent.start(elasticApm.options || {});
}
