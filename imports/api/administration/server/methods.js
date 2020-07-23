import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";
import { Tasks } from "/imports/api/tasks/tasks";
import { Attachments } from "/imports/api/attachments/attachments";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Meetings } from "/imports/api/meetings/meetings";
import { checkAdmin } from "/imports/api/permissions/permissions";

export const methods = {};

methods.info = new ValidatedMethod({
  name: "administration.info",
  validate: null,
  run() {
    checkAdmin();
    const taskCount = Tasks.find({
      deleted: { $ne: true }
    }).count();

    const projectCount = Projects.find({
      deleted: { $ne: true }
    }).count();

    const meetingCount = Meetings.find({
      deleted: { $ne: true }
    }).count();

    const organizationCount = Organizations.find({}).count();
    const processDiagramCount = ProcessDiagrams.find({}).count();
    const healthReportCount = HealthReports.find({}).count();
    const attachmentCount = Attachments.find({}).count();
    const userCount = Meteor.users.find({}).count();

    return {
      organizationCount,
      projectCount,
      taskCount,
      processDiagramCount,
      healthReportCount,
      attachmentCount,
      userCount,
      meetingCount
    };
  }
});
