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
  onAfterUpload(fileRef) {
    if (Meteor.isServer) {
      import { onAfterUpload as handleUpload } from "/imports/api/storage/server/upload";
      import { createThumbnails } from "/imports/api/imageProcessing/server/imageProcessing";

      this.update(
        { _id: fileRef._id },
        { $set: { "meta.createdAt": new Date() } }
      );
      if (/png|jpe?g/i.test(fileRef.extension || "")) {
        createThumbnails(this, fileRef, (error) => {
          if (error) {
            /* eslint no-console:off */
            console.error(error);
          }
          handleUpload({
            collection: Avatars,
            folder: "avatars",
            fileRef: fileRef
          });
        });
      } else {
        handleUpload({
          collection: Avatars,
          folder: "avatars",
          fileRef: fileRef
        });
      }
    }
  },
  interceptDownload(http, fileRef, version) {
    if (Meteor.isServer) {
      import { interceptDownload as handleDownload } from "/imports/api/storage/server/download";

      return handleDownload({
        collection: this,
        http,
        fileRef,
        version
      });
    }
    return false;
  }
});
Avatars.methods = {};

if (Meteor.isServer) {
  Meteor.startup(() => {
    Avatars.collection.rawCollection().createIndex({ "meta.userId": 1 });
  });

  // Intercept FilesCollection's remove method to remove file from other storages
  const _origRemove = Avatars.remove;
  Avatars.remove = function (search) {
    import { onBeforeRemove } from "/imports/api/storage/server/remove";

    onBeforeRemove({ collection: this.collection, search });

    // remove original file from database
    _origRemove.call(this, search);
  };
}
