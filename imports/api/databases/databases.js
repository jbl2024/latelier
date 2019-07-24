import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import moment from "moment";

export const Databases = new Mongo.Collection("databases");
export const Tables = new Mongo.Collection("tables");
export const Records = new Mongo.Collection("records");

if (Meteor.isServer) {
  Meteor.startup(() => {
    Databases.rawCollection().createIndex({ projectId: 1 });
    Tables.rawCollection().createIndex({ databaseId: 1 });
    Records.rawCollection().createIndex({ tableId: 1 });
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
    Meteor.call("databases.initializeTable", databaseId)

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

    const tables = Tables.find({databaseId: id}).fetch();
    tables.map(table => {
      Records.remove({tableId: table._id});
    })
    Tables.remove({databaseId: id})
    Databases.remove(id);
  },

  "databases.initializeTable"(databaseId) {
    const table = {
      databaseId: databaseId,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      name: "Table1",
      columns: [{
        _id: new Mongo.ObjectID().valueOf(),
        name: "Nom",
        type: "text"
      }, {
        _id: new Mongo.ObjectID().valueOf(),
        name: "Notes",
        type: "long_text"
      }]
    }
    const tableId = Tables.insert(table);
    Meteor.call("databases.initializeRecords", tableId);

  },


  "databases.initializeRecords"(tableId) {
    const table = Tables.findOne({_id: tableId});
    const record = {
      tableId: tableId,
    }
    table.columns.map(column => {
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

  "databases.findTable"(tableId) {
    return Tables.findOne({_id: tableId});
  },

  "databases.loadTables"(databaseId) {
    const tables = Tables.find({databaseId: databaseId}).fetch();
    return {
      data: tables
    };
  },

  "databases.loadRecords"(tableId) {
    const records = Records.find({tableId: tableId}).fetch();
    return {
      data: records
    };
  },

  "databases.updateRecord"(tableId, record) {
    check(tableId, String);
    check(record, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (!record._id) {
      delete record._id;
      record.tableId = tableId;
      Records.insert(record);
    } else {
      Records.update({_id: record._id}, {$set: record});
    }
  }
});
