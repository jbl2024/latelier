import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import moment from "moment";

export const Databases = new Mongo.Collection("databases");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Databases.rawCollection().createIndex({ projectId: 1 });
  });
}

Meteor.methods({
  "databases.create"(projectId, name, description) {
    check(projectId, String);
    check(name, String);
    check(description, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    const databaseId = Databases.insert({
      projectId: projectId,
      name: name,
      description: description,
      createdAt: new Date(),
      createdBy: Meteor.userId()
    });

    return databaseId;
  },

  "databases.update"(id, name, description) {
    check(id, String);
    check(name, String);
    check(description, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    const databaseId = Databases.update(
      {
        _id: id
      },
      {
        $set: {
          name: name,
          description: description,
          updatedAt: new Date()
        }
      }
    );

    return databaseId;
  },

  "databases.remove"(id) {
    check(id, String);

    Databases.remove(id);
  }
});
