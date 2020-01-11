import { Backgrounds } from "/imports/api/backgrounds/backgrounds";
import { createThumbnails } from "/imports/api/imageProcessing/server/imageProcessing";

import * as path from "path";
import fs from "fs-extra";

function generateFixtures() {
  const backgrounds = JSON.parse(Assets.getText("backgrounds.json"));
  const basePath = path.dirname(Assets.absoluteFilePath("backgrounds.json"));
  backgrounds.forEach((background) => {
    const backgroundPath = `${basePath}/${background.path}`;
    const { name } = background;
    const { credits } = background;

    const existingBackground = Backgrounds.findOne({ "meta.name": name, "meta.userId": { $exists: false } });
    if (existingBackground) {
      const { thumbnail } = existingBackground.versions;
      if (!thumbnail || !fs.pathExistsSync(thumbnail.path)) {
        /* eslint no-console: off */
        console.log(`Creating thumbnail for ${name}`);
        createThumbnails(Backgrounds, existingBackground, (error) => {
          if (error) {
            /* eslint no-console: off */
            console.error(error);
          }
        });
      }
      return;
    }

    Backgrounds.addFile(backgroundPath, {
      meta: {
        name,
        credits
      }
    });
  });
}

function fixBackgroundLinks() {
  const users = Meteor.users.find({ "profile.background._id": { $exists: true } }).fetch();
  users.forEach((user) => {
    const { background } = user.profile;
    Meteor.users.update(user._id, { $set: { "profile.background": Backgrounds.link(background) } });
  });
}

generateFixtures();
fixBackgroundLinks();
