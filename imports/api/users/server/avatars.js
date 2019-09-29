import { Avatars } from "/imports/api/users/avatars.js";
import { checkLoggedIn } from "/imports/api/permissions/permissions";


Avatars.methods.clear = new ValidatedMethod({
  name: "avatars.clear",
  validate: null,
  run() {
    checkLoggedIn();
    const avatar = Avatars.findOne({ "meta.userId": Meteor.userId() });
    if (!avatar) {
      throw new Meteor.Error("not-found");
    }
    Avatars.remove(avatar._id);
    Meteor.users.update(Meteor.userId(), {
      $unset: { "profile.avatar": 1 }
    });
  }
});


Avatars.methods.setAvatar = new ValidatedMethod({
  name: "avatars.setAvatar",
  validate: new SimpleSchema({
    avatarId: { type: String }
  }).validator(),
  run({ avatarId }) {
    checkLoggedIn();
    const userId = Meteor.userId();
    Avatars.remove({
      "meta.userId": userId,
      _id: {
        $ne: avatarId
      }
    });
    const avatar = Avatars.findOne({ "meta.userId": userId, _id: avatarId });
    if (!avatar) {
      throw new Meteor.Error("not-found");
    }

    Meteor.users.update(userId, {
      $set: { "profile.avatar": avatar.link("thumbnail") }
    });
  }
});
