import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* relations */
  userId: {
    type: String
  },

  /* main attributes */
  type: {
    type: String
  },

  properties: { 
    type: Object, 
    optional: true, 
    blackbox: true 
  },
  
  read: {
    type: Boolean,
    defaultValue: false
  },

  /* creation dates */
  createdAt: Date
});
