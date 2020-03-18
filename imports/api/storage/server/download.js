import { interceptDownload as s3Download } from "./s3";

export const interceptDownload = ({ collection, http, fileRef, version }) => {
  const storageType = Meteor.settings.storage?.type;
  if (storageType === "s3") {
    return s3Download({ collection, http, fileRef, version });
  }
  return false;
};
