import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  type: String,
  when: Date,
  projectId: {
    type: String,
    optional: true
  },
  taskId: {
    type: String,
    optional: true
  },
  properties: {
    type: Object,
    optional: true,
    blackbox: true
  }
});
