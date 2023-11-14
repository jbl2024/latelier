import fs from "fs-extra";
import { Log } from "meteor/logging";
import * as path from "path";
import { Backgrounds } from "/imports/api/backgrounds/backgrounds";
import { createThumbnails } from "/imports/api/imageProcessing/server/imageProcessing";

async function generateFixtures() {
  const backgrounds = JSON.parse(Assets.getText("backgrounds.json"));
  const basePath = path.dirname(Assets.absoluteFilePath("backgrounds.json"));
  backgrounds.forEach(async (background) => {
    const backgroundPath = `${basePath}/${background.path}`;
    const { name } = background;
    const { credits } = background;

    const existingBackground = Backgrounds.findOne({ "meta.name": name, "meta.userId": { $exists: false } });
    if (existingBackground) {
      const { thumbnail } = existingBackground.versions;
      if (!thumbnail || !fs.pathExistsSync(thumbnail.path)) {
        /* eslint no-console: off */
        Log.log(`Creating thumbnail for ${name}`);
        await createThumbnails(Backgrounds, existingBackground, (error) => {
          if (error) {
            /* eslint no-console: off */
            console.error(error);
          }
        });
      }
      return;
    }

    // addFile add existing local file without copying it
    Backgrounds.addFile(backgroundPath, {
      meta: {
        name,
        credits
      }
    });
  });
}

async function fixBackgroundLinks() {
  const users = Meteor.users.find({ "profile.background._id": { $exists: true } });
  await users.forEachAsync(async (user) => {
    const { background } = user.profile;
    await Meteor.users.updateAsync(user._id, { $set: { "profile.background": Backgrounds.link(background) } });
  });
}

await generateFixtures();
await fixBackgroundLinks();
