import { Meteor } from "meteor/meteor";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "../projects";
import { Organizations } from "../../organizations/organizations";
import { ProjectGroups } from "../../projectGroups/projectGroups";
import { Lists } from "../../lists/lists";
import { Tasks } from "../../tasks/tasks";
import { Attachments } from "../../attachments/attachments";
import { Resources } from "../../resources/resources";
import { Permissions } from "/imports/api/permissions/permissions"


Meteor.publish("projects", function projectsPublication(organizationId, name, groupId) {
  var userId = Meteor.userId();
  let query = {
    deleted: {$ne: true}
  }

  if (!Permissions.isAdmin(Meteor.userId())) {
    query['$or'] = [{createdBy: userId}, {members: userId}, {isPublic: true}];
  }

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

publishComposite("allProjects", (name) => {
  return {
    // projects
    find() {
      const userId = Meteor.userId();
      let query = { deleted: {$ne: true} };
    
      if (!Permissions.isAdmin(userId)) {
        query['$or'] = [{createdBy: userId}, {members: userId}];
      }
    
      if (name && name.length > 0) {
        query['name'] = { $regex: ".*" + name + ".*", $options: "i" };
      } 
      return Projects.find(query);
    },
    children: [
      {
        // users
        find(project) {
          var members = project.members || [];
          if (project.createdBy) {
            members.push(project.createdBy);
          }
          if (project.updatedBy) {
            members.push(project.updatedBy);
          }
          return Meteor.users.find(
            { _id: { $in: members } },
            { fields: { profile: 1, status: 1, statusDefault: 1, statusConnection: 1, emails: 1 } }
          );
        }
      },
      {
        // groups
        find(project) {
          if (!project.organizationId) {
            this.ready();
            return;
          }
          return ProjectGroups.find({ organizationId: project.organizationId }, { sort: { name: 1 } });
        }
      }
    ]
  };
});

Meteor.publish("projectsForTimeline", function projectsForTimelinePublication(organizationId, name, groupId) {
  var userId = Meteor.userId();
  let query = {
    deleted: {$ne: true},
    'startDate':{ $ne: null},
    'endDate':{ $ne: null},
  }
  if (!Permissions.isAdmin(Meteor.userId())) {
    query['$or'] = [{createdBy: userId}, {members: userId}, {isPublic: true}];
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
      const userId = Meteor.userId();
      const query = {
        _id: projectId,
        deleted: {$ne: true}
      };
      if (!Permissions.isAdmin(Meteor.userId())) {
        query['$or'] = [{createdBy: userId}, {members: userId}, {isPublic: true}];
      }
      return Projects.find(query);
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
          return Tasks.find({ projectId: project._id, deleted: {$ne: true} }, { sort: { order: 1 } });
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
          if (!project.organizationId) {
            this.ready();
            return;
          }
          return ProjectGroups.find({ organizationId: project.organizationId }, { sort: { name: 1 } });
        }
      },
      {
        // resources
        find(project) {
          if (!project.organizationId) {
            this.ready();
            return;
          }
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
