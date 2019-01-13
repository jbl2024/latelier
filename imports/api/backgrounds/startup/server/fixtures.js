import { Backgrounds } from "/imports/api/backgrounds/backgrounds";

import * as path from "path";

function generateFixtures() {
  const backgrounds = JSON.parse(Assets.getText("backgrounds.json"));
  const basePath = path.dirname(Assets.absoluteFilePath("backgrounds.json"));
  backgrounds.map(background => {
    const backgroundPath = `${basePath}/${background.path}`;
    const name = background.name;
    const credits = background.credits;

    const existingBackground = Backgrounds.findOne({'meta.name': name, 'meta.userId': {$exists : false}});
    if (existingBackground) return;

    Backgrounds.addFile(backgroundPath, {
      meta: {
        name: name,
        credits: credits
      }
    });
  });
}

generateFixtures();
