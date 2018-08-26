import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "../projects";
import { ProjectGroups } from "../../projectGroups/projectGroups";
import { Lists } from "../../lists/lists";
import { Tasks } from "../../tasks/tasks";

// This code only runs on the server
Meteor.publish("projects", function projectsPublication(name, groupId) {
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
  return Projects.find(query);
});

Meteor.publish("projectsForTimeline", function projectsForTimelinePublication(name, groupId) {
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
