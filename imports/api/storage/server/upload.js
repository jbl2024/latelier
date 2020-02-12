import { onAfterUpload as s3Upload } from "./s3";

export const onAfterUpload = ({ collection, folder, fileRef }) => {
  const storageType = Meteor.settings.storage?.type;
  if (storageType === "s3") {
    s3Upload({ collection, folder, fileRef });
  }
};
