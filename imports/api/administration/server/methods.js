import { Attachments } from "/imports/api/attachments/attachments";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import { HealthReports } from "/imports/api/healthReports/healthReports";
import { Meetings } from "/imports/api/meetings/meetings";
import { Organizations } from "/imports/api/organizations/organizations";
import { checkAdmin } from "/imports/api/permissions/permissions";
import { Projects } from "/imports/api/projects/projects";
import { Tasks } from "/imports/api/tasks/tasks";

export const methods = {};

methods.info = new ValidatedMethod({
  name: "administration.info",
  validate: null,
  async run() {
    checkAdmin();
    const taskCount = await Tasks.find({
      deleted: { $ne: true }
    }).countAsync();

    const projectCount = await Projects.find({
      deleted: { $ne: true }
    }).countAsync();

    const meetingCount = await Meetings.find({
      deleted: { $ne: true }
    }).countAsync();

    const organizationCount = await Organizations.find({}).countAsync();
    const processDiagramCount = await ProcessDiagrams.find({}).countAsync();
    const healthReportCount = await HealthReports.find({}).countAsync();
    const attachmentCount = await Attachments.find({}).countAsync();
    const userCount = await Meteor.users.find({}).countAsync();

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
