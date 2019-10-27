import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { publishComposite } from "meteor/reywood:publish-composite";

import { Projects } from "../projects";
import { Organizations } from "../../organizations/organizations";
import { ProjectGroups } from "../../projectGroups/projectGroups";
import { Lists } from "../../lists/lists";
import { Tasks } from "../../tasks/tasks";
import { Attachments } from "../../attachments/attachments";
import { Permissions } from "/imports/api/permissions/permissions";

Meteor.publish("projects", function projectsPublication(
  organizationId,
  name,
  groupId
) {
  check(organizationId, String);
  check(name, Match.Maybe(String));
  check(groupId, Match.Maybe(String));
  const userId = Meteor.userId();
  const query = {
    deleted: { $ne: true }
  };

  if (!Permissions.isAdmin(Meteor.userId())) {
    query.$or = [
      { createdBy: userId },
      { members: userId },
      { isPublic: true }
    ];
  }

  if (name && name.length > 0) {
    query.name = { $regex: `.*${name}.*`, $options: "i" };
  }

  if (groupId && groupId.length > 0) {
    const projectGroup = ProjectGroups.findOne({ _id: groupId });
    if (projectGroup) {
      const { projects } = projectGroup;
      query._id = { $in: projects };
    }
  }

  query.organizationId = organizationId;
  return Projects.find(query);
});

publishComposite("allProjects", (name, organizationId) => ({
  // projects
  find() {
    const userId = Meteor.userId();
    const query = { deleted: { $ne: true } };

    if (!Permissions.isAdmin(userId)) {
      query.$or = [{ createdBy: userId }, { members: userId }];
    }

    if (name && name.length > 0) {
      query.name = { $regex: `.*${name}.*`, $options: "i" };
    }
    if (organizationId) {
      query.organizationId = organizationId;
    }
    return Projects.find(query);
  },
  children: [
    {
      // users
      find(project) {
        const members = project.members || [];
        if (project.createdBy) {
          members.push(project.createdBy);
        }
        if (project.updatedBy) {
          members.push(project.updatedBy);
        }
        return Meteor.users.find(
          { _id: { $in: members } },
          {
            fields: {
              profile: 1,
              status: 1,
              statusDefault: 1,
              statusConnection: 1,
              emails: 1
            }
          }
        );
      }
    },
    {
      // groups
      find(project) {
        if (!project.organizationId) {
          this.ready();
          return null;
        }
        return ProjectGroups.find(
          { organizationId: project.organizationId },
          { sort: { name: 1 } }
        );
      }
    }
  ]
}));

Meteor.publish("projectsForTimeline", function projectsForTimelinePublication(
  organizationId,
  name,
  groupId
) {
  check(organizationId, String);
  check(name, Match.Maybe(String));
  check(groupId, Match.Maybe(String));

  const userId = Meteor.userId();
  const query = {
    deleted: { $ne: true }
  };
  if (!Permissions.isAdmin(Meteor.userId())) {
    query.$or = [{ members: userId }];
  }

  if (name && name.length > 0) {
    query.name = { $regex: `.*${name}.*`, $options: "i" };
  }

  if (groupId && groupId.length > 0) {
    const projectGroup = ProjectGroups.findOne({ _id: groupId });
    if (projectGroup) {
      const { projects } = projectGroup;
      query._id = { $in: projects };
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
        deleted: { $ne: true }
      };
      if (!Permissions.isAdmin(Meteor.userId())) {
        query.$or = [
          { createdBy: userId },
          { members: userId },
          { isPublic: true }
        ];
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
          return Tasks.find(
            { projectId: project._id, deleted: { $ne: true } },
            { sort: { order: 1 } }
          );
        }
      },
      {
        // attachments
        find(project) {
          return Attachments.find({ "meta.projectId": project._id }).cursor;
        }
      },
      {
        // groups
        find(project) {
          if (!project.organizationId) {
            this.ready();
            return null;
          }
          return ProjectGroups.find(
            { organizationId: project.organizationId },
            { sort: { name: 1 } }
          );
        }
      },
      {
        // organizations
        find(project) {
          if (!project.organizationId) {
            this.ready();
            return null;
          }
          return Organizations.find(
            { _id: project.organizationId },
            { sort: { name: 1 } }
          );
        }
      },
      {
        // users
        find(project) {
          const members = Array.from(project.members) || [];
          const tasks = Tasks.find(
            { projectId: project._id, deleted: { $ne: true } },
            { fields: { createdBy: 1, updatedBy: 1 } }
          );
          tasks.forEach((task) => {
            if (task.createdBy) members.push(task.createdBy);
            if (task.updatedBy) members.push(task.updatedBy);
            if (task.watchers) {
              members.push(task.watchers.map((watcher) => watcher));
            }
          });

          if (project.organizationId) {
            const organization = Organizations.findOne(
              { _id: project.organizationId },
              { fields: { members: 1 } }
            );
            if (organization) {
              organization.members.forEach((member) => {
                members.push(member);
              });
            }
          }

          return Meteor.users.find(
            { _id: { $in: [...new Set(members)] } },
            {
              fields: {
                profile: 1,
                status: 1,
                statusDefault: 1,
                statusConnection: 1,
                emails: 1
              }
            }
          );
        }
      }
    ]
  };
});
