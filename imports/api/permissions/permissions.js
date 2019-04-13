import { Meteor } from 'meteor/meteor';
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Projects } from "/imports/api/projects/projects.js";

const ApplicationRoles = Object.freeze({
  ADMIN: "admin",
  INACTIVE: "inactive"
});

export const Permissions = {
  isAdmin (userId, scope=Roles.GLOBAL_GROUP) {
    if (!userId) {
      return false;
    }
    return Roles.userIsInRole(userId, ApplicationRoles.ADMIN, scope)
  },

  setAdmin(userId, scope=Roles.GLOBAL_GROUP) {
    let accessGranted = false;
    if (this.isAdmin(Meteor.userId())) {
      accessGranted = true;
    } else if (this.isAdmin(Meteor.userId(), scope)) {
      accessGranted = true;
    }
    if (!accessGranted) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, scope)
  },

  initializeProjectPermissions(project) {
    Roles.addUsersToRoles(project.createdBy, ApplicationRoles.ADMIN, project._id)
  },

  removeAdmin(userId, scope=Roles.GLOBAL_GROUP) {
    let accessGranted = false;
    if (this.isAdmin(Meteor.userId())) {
      accessGranted = true;
    } else if (this.isAdmin(Meteor.userId(), scope)) {
      accessGranted = true;
    }
    if (!accessGranted) {
      throw new Meteor.Error(401, "not-authorized");
    }
    if (scope === Roles.GLOBAL_GROUP) {
      if (Meteor.userId() === userId) {
        throw new Meteor.Error(401, "cannot-remove-self");
      }
    }
    Roles.removeUsersFromRoles(userId, ApplicationRoles.ADMIN, scope)
  },

  isActive (userId) {
    if (!userId) {
      return false;
    }
    return !Roles.userIsInRole(userId, ApplicationRoles.INACTIVE, Roles.GLOBAL_GROUP)
  },

  setInactive (userId) {
    if (!this.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    Roles.addUsersToRoles(userId, ApplicationRoles.INACTIVE, Roles.GLOBAL_GROUP)
    Meteor.users.update(userId, {
      $set: {
          "services.resume.loginTokens": []
      }
    });
  },

  setActive (userId) {
    if (!this.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }
    if (this.isActive(userId)) {
      return;
    }
    Roles.removeUsersFromRoles(userId, ApplicationRoles.INACTIVE, Roles.GLOBAL_GROUP)
  }
}

if (Meteor.isServer) {
  Accounts.validateLoginAttempt(function(attemptObj) {
    if (attemptObj.user && !Permissions.isActive(attemptObj.user._id)) {
      throw new Meteor.Error(403, "Your account is disabled.");
    }
    if (!attemptObj.user) {
      return false;
    }
    if (Permissions.isAdmin(attemptObj.user._id)) {
      return true;
    }

    if (attemptObj.user.emails[0].verified === true) {
      return true;
    } else {
      throw new Meteor.Error('email-not-verified', 'You must verify your email address before you can log in');
    }
    
    return true;
  });
}


export const checkLoggedIn = () => {
  if (!Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
}

Permissions.methods = {};

Permissions.methods.setAdmin = new ValidatedMethod({
  name: "permissions.setAdmin",
  validate: new SimpleSchema({
    userId: { type: String },
    scope: { type: String, optional: true },
  }).validator(),
  run({ userId, scope }) {
    checkLoggedIn();
   
    if (!scope) {
      scope = Roles.GLOBAL_GROUP;
    }
    Permissions.setAdmin(userId, scope)
  }
});

Permissions.methods.initializeProjectPermissions = new ValidatedMethod({
  name: "permissions.initializeProjectPermissions",
  validate: new SimpleSchema({
    projectId: { type: String },
  }).validator(),
  run({ projectId }) {
    checkLoggedIn();
    
    const project = Projects.findOne({_id: projectId});
    const userId = project.createdBy;
    if (!userId) return;
    Roles.addUsersToRoles(userId, ApplicationRoles.ADMIN, projectId);
  }
});

Permissions.methods.removeAdmin = new ValidatedMethod({
  name: "permissions.removeAdmin",
  validate: new SimpleSchema({
    userId: { type: String },
    scope: { type: String, optional: true },
  }).validator(),
  run({ userId, scope }) {
    checkLoggedIn();
   
    if (!scope) {
      scope = Roles.GLOBAL_GROUP;
    }
    Permissions.removeAdmin(userId, scope)
  }
});

if (Meteor.isServer) {
  Permissions.methods.canReadProject = new ValidatedMethod({
    name: "permissions.canReadProject",
    validate: new SimpleSchema({
      projectId: { type: String }
    }).validator(),
    run({projectId}) {
      checkLoggedIn();
      check(projectId, String);
      const userId = Meteor.userId();
      if (Permissions.isAdmin(userId)) {
        return true;
      }
      const project = Projects.findOne({_id: projectId, $or: [{createdBy: userId}, {members: userId}, {isPublic: true}]});
      if (project) {
        return true;
      } else {
        throw new Meteor.Error('not-authorized');  
      }
    }
  });
}