import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
import {
  checkCanWriteProject,
  checkCanWriteTask,
  runAsUser
} from "/imports/api/permissions/permissions";

export const Attachments = new FilesCollection({
  collectionName: "Attachments",
  storagePath: Meteor.settings.attachmentsPath || "assets/app/uploads",
  allowClientCode: true, // Disallow remove files from Client
  onBeforeUpload(fileData) {
    return runAsUser(this.userId, function() {
      if (fileData.meta?.taskId) {
        try {
          checkCanWriteTask(fileData.meta.taskId);
        } catch (error) {
          return false;
        }
      }
      if (fileData.meta?.projectId) {
        try {
          checkCanWriteProject(fileData.meta.projectId);
        } catch (error) {
          return false;
        }
      }
      return true;
    });
  },
  onAfterUpload(fileRef) {
    if (Meteor.isServer) {
      import { onAfterUpload as handleUpload } from "/imports/api/storage/server/upload";

      this.update(
        { _id: fileRef._id },
        { $set: { "meta.createdAt": new Date() } }
      );

      handleUpload({
        collection: Attachments,
        folder: "attachments",
        fileRef: fileRef
      });
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

if (Meteor.isServer) {
  Meteor.startup(() => {
    Attachments.collection.rawCollection().createIndex({ "meta.projectId": 1 });
    Attachments.collection.rawCollection().createIndex({ metataskId: 1 });
  });

  // Intercept FilesCollection's remove method to remove file from other storages
  const _origRemove = Attachments.remove;
  Attachments.remove = function (search) {
    import { onBeforeRemove } from "/imports/api/storage/server/remove";

    onBeforeRemove({ collection: this.collection, search });

    // remove original file from database
    _origRemove.call(this, search);
  };
}
Attachments.methods = {};
