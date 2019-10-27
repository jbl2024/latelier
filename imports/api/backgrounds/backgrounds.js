import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
import { check } from "meteor/check";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

export const Backgrounds = new FilesCollection({
  collectionName: "backgrounds",
  storagePath:
    Meteor.settings.backgroundsPath
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
            /* eslint no-console: off */
            console.error(error);
          }
        });
      }
    }
  }
});

if (Meteor.isServer) {
  Meteor.startup(() => {
    Backgrounds.collection
      .rawCollection()
      .createIndex({ "metadata.userId": 1 });
    Backgrounds.collection.rawCollection().createIndex({ "metadata.name": 1 });
  });
}
if (!Backgrounds.methods) {
  Backgrounds.methods = {};
}

Meteor.methods({
  "backgrounds.remove"(id) {
    check(id, String);

    Backgrounds.remove(id);
  },

  "backgrounds.find"() {
    return Backgrounds.find({}).fetch();
  }
});

if (Meteor.isServer) {
  Backgrounds.methods.choose = new ValidatedMethod({
    name: "backgrounds.choose",
    validate: new SimpleSchema({
      backgroundId: { type: String }
    }).validator(),
    run({ backgroundId }) {
      checkLoggedIn();
      const background = Backgrounds.findOne({ _id: backgroundId });
      if (!background) {
        throw new Meteor.Error("not-found");
      }
      Meteor.users.update(Meteor.userId(), {
        $set: { "profile.background": background.link() }
      });
    }
  });

  Backgrounds.methods.clear = new ValidatedMethod({
    name: "backgrounds.clear",
    validate: null,
    run() {
      checkLoggedIn();
      Meteor.users.update(Meteor.userId(), {
        $unset: { "profile.background": 1 }
      });
    }
  });
}
