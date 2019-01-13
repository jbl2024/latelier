import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
import { check } from "meteor/check";


export const Backgrounds = new FilesCollection({
  collectionName: "backgrounds",
  storagePath: Meteor.settings.backgroundsPath || Meteor.settings.attachmentsPath || 'assets/app/uploads',
  allowClientCode: true, 
  onBeforeUpload(file) {
    return true;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
      this.update({ _id: file._id }, { $set: {'meta.createdAt': new Date()}});
    }
  } 
});

if (Meteor.isServer) {
  Meteor.startup(() => {
    Backgrounds.collection.rawCollection().createIndex({"metadata.userId": 1});
    Backgrounds.collection.rawCollection().createIndex({"metadata.name": 1});
  });
}

Meteor.methods({
  'backgrounds.remove'(id) {
    check(id, String);

    Backgrounds.remove(id);
  }
});