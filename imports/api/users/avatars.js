import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";

export const Avatars = new FilesCollection({
  collectionName: "avatars",
  storagePath:
    Meteor.settings.avatarsPath
    || Meteor.settings.attachmentsPath
    || "assets/app/uploads",
  allowClientCode: true,
  onBeforeUpload() {
    return true;
  },
  onAfterUpload(file) {
    if (Meteor.isServer) {
      import { createThumbnails } from "/imports/api/imageProcessing/server/imageProcessing";

      this.update(
        { _id: file._id },
        { $set: { "meta.createdAt": new Date() } }
      );
      if (/png|jpe?g/i.test(file.extension || "")) {
        createThumbnails(this, file, (error) => {
          if (error) {
            /* eslint no-console:off */
            console.error(error);
          }
        });
      }
    }
  }
});
Avatars.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Avatars.collection.rawCollection().createIndex({ "meta.userId": 1 });
  });
}
