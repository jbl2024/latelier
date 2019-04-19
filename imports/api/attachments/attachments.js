import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";

export const Attachments = new FilesCollection({
  collectionName: "Attachments",
  storagePath: Meteor.settings.attachmentsPath || "assets/app/uploads",
  allowClientCode: true, // Disallow remove files from Client
  onBeforeUpload(file) {
    return true;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
      this.update(
        { _id: file._id },
        { $set: { "meta.createdAt": new Date() } }
      );
    }
  }
});

if (Meteor.isServer) {
  Meteor.startup(() => {
    Attachments.collection.rawCollection().createIndex({ "meta.projectId": 1 });
    Attachments.collection.rawCollection().createIndex({ metataskId: 1 });
  });
}
Attachments.methods = {};
