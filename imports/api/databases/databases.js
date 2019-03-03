import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import moment from "moment";

export const Databases = new Mongo.Collection("databases");
export const Records = new Mongo.Collection("records");
if (Meteor.isServer) {
  Meteor.startup(() => {
    Databases.rawCollection().createIndex({ projectId: 1 });
    Records.rawCollection().createIndex({ databaseId: 1 });
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
      createdBy: Meteor.userId(),
      columns: [{
        _id: new Mongo.ObjectID().valueOf(),
        name: "Nom",
        type: "text"
      }, {
        _id: new Mongo.ObjectID().valueOf(),
        name: "Notes",
        type: "long_text"
      }]
    });

    Meteor.call("databases.initializeRecords", databaseId);

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

    Records.remove({databaseId: id})
    Databases.remove(id);
  },

  "databases.initializeRecords"(databaseId) {
    const database = Databases.findOne({_id: databaseId});
    const record = {
      databaseId: databaseId,
    }
    database.columns.map(column => {
      record[column._id] = "";
    })
    Records.insert(record);
    Records.insert(record);
    Records.insert(record);
    Records.insert(record);
  },

  "databases.findOne"(databaseId) {
    return Databases.findOne({_id: databaseId});
  },

  "databases.loadRecords"(databaseId) {
    const records = Records.find({databaseId: databaseId}).fetch();
    return {
      data: records
    };
  },

  "databases.updateRecord"(databaseId, record) {
    check(databaseId, String);
    check(record, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (!record._id) {
      delete record._id;
      record.databaseId = databaseId;
      Records.insert(record);
    } else {
      Records.update({_id: record._id}, {$set: record});
    }
  }
});
