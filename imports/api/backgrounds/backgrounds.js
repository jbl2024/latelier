import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Log } from "meteor/logging";
import { Meteor } from "meteor/meteor";
import { FilesCollection } from "meteor/ostrio:files";
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
  async onAfterUpload(file) {
    if (Meteor.isServer) {
      import { createThumbnails } from "/imports/api/imageProcessing/server/imageProcessing";

      this.update(
        { _id: file._id },
        { $set: { "meta.createdAt": new Date() } }
      );
      if (/png|jpe?g/i.test(file.extension || "")) {
        await createThumbnails(this, file, (error) => {
          if (error) {
            Log.error(error);
          }
        });
      }
    }
  }
});

if (Meteor.isServer) {
  Meteor.startup(async () => {
    await Backgrounds.collection
      .rawCollection()
      .createIndex({ "metadata.userId": 1 });
    await Backgrounds.collection.rawCollection().createIndex({ "metadata.name": 1 });
  });
}
if (!Backgrounds.methods) {
  Backgrounds.methods = {};
}

Meteor.methods({
  async "backgrounds.remove"(id) {
    check(id, String);

    await Backgrounds.removeAsync(id);
  },

  async "backgrounds.find"() {
    return Backgrounds.find({}).fetch();
  }
});

if (Meteor.isServer) {
  Backgrounds.methods.choose = new ValidatedMethod({
    name: "backgrounds.choose",
    validate: new SimpleSchema({
      backgroundId: { type: String }
    }).validator(),
    async run({ backgroundId }) {
      checkLoggedIn();
      const background = Backgrounds.findOne({ _id: backgroundId });
      if (!background) {
        throw new Meteor.Error("not-found");
      }
      await Meteor.users.updateAsync(Meteor.userId(), {
        $set: { "profile.background": background.link() }
      });
    }
  });

  Backgrounds.methods.clear = new ValidatedMethod({
    name: "backgrounds.clear",
    validate: null,
    async run() {
      checkLoggedIn();
      await Meteor.users.updateAsync(Meteor.userId(), {
        $unset: { "profile.background": 1 }
      });
    }
  });
}
