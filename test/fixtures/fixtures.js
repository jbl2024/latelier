import faker from "faker";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects } from "/imports/api/projects/projects";

function generateUsers() {
  faker.locale = "fr";

  Accounts.createUser({
    createdAt: new Date(),
    password: "password",
    email: "user@user.com",
    profile: {
      firstName: "user",
      lastName: "user"
    }
  });

  for (let i = 0; i < 9; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = `${firstName}.${lastName}@gmail.com`;

    const userData = {
      createdAt: new Date(),
      password: "password",
      email,
      profile: {
        firstName,
        lastName
      }
    };
    Accounts.createUser(userData);
  }
}

function generateOrganizations() {
  Organizations.insert({
    name: "organization",
    createdAt: new Date(),
    createdBy: Meteor.users.findOne()._id,
    members: [Meteor.users.findOne()._id]
  });
}

function generateProjects() {
  Projects.insert({
    name: "organization",
    organizationId: Organizations.findOne(),
    createdAt: new Date(),
    createdBy: Meteor.users.findOne()._id,
    members: [Meteor.users.findOne()._id]
  });
}

export const initData = function() {
  resetDatabase();
  generateUsers();
  generateOrganizations();
  generateProjects();
};
