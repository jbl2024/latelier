import { Backgrounds } from "/imports/api/backgrounds/backgrounds";
import { checkLoggedIn } from "/imports/api/permissions/permissions";

import { HTTP } from "meteor/http";

Backgrounds.methods.findUnsplash = new ValidatedMethod({
  name: "backgrounds.findUnsplash",
  validate: new SimpleSchema({
    name: { type: String, optional: true },
    page: { type: Number },
  }).validator(),
  run({ name, page }) {
    checkLoggedIn();

    const unsplashEnabled = Meteor.settings.unsplash ? Meteor.settings.unsplash.enabled : false;
    if (!unsplashEnabled) {
      throw new Meteor.Error("unsplash-not-enabled");
    }

    const accessKey =  Meteor.settings.unsplash ? Meteor.settings.unsplash.accessKey : null;
    if (!accessKey) throw new Meteor.Error("unsplash-missing-access-key");

    const url = `https://api.unsplash.com/search/photos?client_id=${accessKey}&page=${page}&query=${name}&per_page=12`;

    console.log(url)
    const result = HTTP.get(url)
    if (result.statusCode !== 200) {
      throw new Meteor.Error("unsplash-error", data.statusCode);  
    }
    const data = result.data;
    return {
      rowsPerPage: data.results.length,
      totalItems: data.total,
      data: data.results
    };        
  }
});