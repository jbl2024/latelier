import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
import { check } from "meteor/check";

export const Attachments = new FilesCollection({
  collectionName: "Attachments",
  allowClientCode: true, // Disallow remove files from Client
  onBeforeUpload(file) {
    return true;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
      this.update({ _id: file._id }, { $set: {'meta.createdAt': new Date()}});
    }
  }
});


Meteor.methods({
  'attachments.remove'(attachmentId) {
    check(attachmentId, String);

    Attachments.remove(attachmentId);
  }
});