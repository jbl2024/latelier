import { onBeforeRemove as s3Remove } from "./s3";

export const onBeforeRemove = ({ collection, search }) => {
  const storageType = Meteor.settings.storage?.type;
  if (storageType === "s3") {
    s3Remove({ collection, search });
  }
};
