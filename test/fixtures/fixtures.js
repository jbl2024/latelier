import faker from "faker";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { Organizations } from "/imports/api/organizations/organizations";
import { Projects, ProjectStates } from "/imports/api/projects/projects";

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

async function generateOrganizations() {
  await Organizations.insertAsync({
    name: "organization",
    createdAt: new Date(),
    createdBy: (await Meteor.users.findOneAsync())._id,
    members: [(await Meteor.users.findOneAsync())._id]
  });
}

export const createProject = async (context, projectData) => {
  projectData = projectData || {
    name: "projectA",
    projectType: "kanban",
    state: ProjectStates.PRODUCTION
  };
  const projectId = await Projects.methods.create._execute(context, projectData);
  return projectId;
};

async function generateProjects() {
  await Projects.insertAsync({
    name: "organization",
    organizationId: Organizations.findOne(),
    createdAt: new Date(),
    createdBy: (await Meteor.users.findOneAsync())._id,
    members: [(await Meteor.users.findOneAsync())._id]
  });
}

export const initData = async function() {
  await resetDatabase();
  await generateUsers();
  await generateOrganizations();
  await generateProjects();
};
