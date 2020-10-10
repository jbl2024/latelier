import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  objectId: {
    type: String
  },
  version: {
    type: String
  },
  steps: {
    type: Object,
    blackbox: true
  }
});
