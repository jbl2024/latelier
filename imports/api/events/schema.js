import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  /* relations */
  userId: {
    type: String,
    optional: true
  },

  /* main attributes */
  type: {
    type: String
  },

  important: {
    type: Boolean,
    defaultValue: false
  },

  properties: { 
    type: Object, 
    optional: true, 
    blackbox: true 
  },
  
  /* creation dates */
  createdAt: Date
});
