import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
import { ENGINE_METHOD_CIPHERS } from "constants";

export const Attachments = new FilesCollection({
  collectionName: "Attachments",
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    return true;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
      this.update({ _id: file._id }, { $set: {'meta.createdAt': new Date()}});
    }
  }
});
