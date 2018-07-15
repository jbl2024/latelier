import { Meteor } from 'meteor/meteor'

// Basic User
export const isBasicAuth = (to, from, next) => {
  if (!Meteor.userId()) {
    next({
      name: 'login'
    })
  } else {
    next()
  }
}
