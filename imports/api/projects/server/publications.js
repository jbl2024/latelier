import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "../projects";
import { ProjectGroups } from "../../projectGroups/projectGroups";
import { Lists } from "../../lists/lists";
import { Tasks } from "../../tasks/tasks";
import { Attachments } from "../../attachments/attachments";
import { Resources } from "../../resources/resources";

Meteor.publish("projects", function projectsPublication(organizationId, name, groupId) {
  var userId = Meteor.userId();
  var query = {$or: [{createdBy: userId}, {members: userId}, {isPublic: true}]};
  if (name && name.length > 0) {
    query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
  } 

  if (groupId && groupId.length > 0) {  
    var projectGroup = ProjectGroups.findOne({_id: groupId});
    if (projectGroup) {
      var projects = projectGroup.projects;
      query['_id'] = {$in: projects};
    }
  }
  query.organizationId = organizationId;
  return Projects.find(query);
});

Meteor.publish("projectsForTimeline", function projectsForTimelinePublication(organizationId, name, groupId) {
  var userId = Meteor.userId();
  var query = {
    $or: [{createdBy: userId}, {members: userId}, {isPublic: true}], 
    'startDate':{ $ne: null},
    'endDate':{ $ne: null},
  }
  if (name && name.length > 0) {
    query.name = { $regex: ".*" + name + ".*", $options: "i" };
  }
  
  if (groupId && groupId.length > 0) {  
    var projectGroup = ProjectGroups.findOne({_id: groupId});
    if (projectGroup) {
      var projects = projectGroup.projects;
      query._id = {$in: projects};
    }
  }
  query.organizationId = organizationId;
  return Projects.find(query);
});

publishComposite("project", function(projectId) {
  return {
    find() {
      return Projects.find({ _id: projectId });
    },
    children: [
      {
        // lists
        find(project) {
          return Lists.find({ projectId: project._id }, { sort: { order: 1 } });
        }
      },
      {
        // tasks
        find(project) {
          return Tasks.find({ projectId: project._id }, { sort: { order: 1 } });
        },
      },
      {
        // attachments
        find(project) {
          return Attachments.find({ 'meta.projectId': project._id }).cursor;
        }
      },
      {
        // groups
        find(project) {
          return ProjectGroups.find({ organizationId: project.organizationId }, { sort: { name: 1 } });
        }
      },
      {
        // resources
        find(project) {
          return Resources.find({ organizationId: project.organizationId }, { sort: { name: 1 } });
        }
      },
      {
        // users
        find(project) {
          var members = project.members || [];
          return Meteor.users.find(
            { _id: { $in: members } },
            { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 } }
          );
        }
      }
    ]
  };
});
