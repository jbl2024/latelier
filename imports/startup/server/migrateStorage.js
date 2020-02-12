import { migrateCollectionToS3 } from "/imports/api/storage/server/s3";
import { Attachments } from "/imports/api/attachments/attachments";
import { Avatars } from "/imports/api/users/avatars.js";

if (Meteor.settings.storage?.migrateFromFS) {
  /* eslint no-console: off */
  console.log("Starting migration from FS to storage");

  const storageType = Meteor.settings.storage?.type;
  if (storageType === "s3") {
    /* eslint no-console: off */
    console.log("=> s3");
    migrateCollectionToS3({
      collection: Attachments,
      folder: "attachments",
      search: {}
    });
    migrateCollectionToS3({
      collection: Avatars,
      folder: "avatars",
      search: {}
    });
  }
  /* eslint no-console: off */
  console.log("Migration from FS to storage done");
}
