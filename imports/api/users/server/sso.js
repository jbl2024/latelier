import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base'

import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Permissions } from "/imports/api/permissions/permissions"

import { removeAllListeners } from "cluster";

Accounts.registerLoginHandler(loginRequest => {

});

Meteor.methods({
  "users.ssoAuthenticate"() {
    const email = headers.get(this, Meteor.settings.public.sso.email);
    if (!email) {
      throw new Meteor.Error("no-email");
    }

    let user =  Accounts.findUserByEmail(email); 
    if (!user) {
      const userData = {
        createdAt: new Date(),
        email: email
      };
      const userId = Accounts.createUser(userData);
      Meteor.users.update(
        { _id: userId },
        { $set: {
          'services.email.verificationTokens': [],
          'emails.0.verified': true
        } }
      );
      user =  Accounts.findUserByEmail(email); 
    }

		// Create hashed token so user stays logged in
		var stampedToken = Accounts._generateStampedLoginToken();
		var hashStampedToken = Accounts._hashStampedToken(stampedToken);
		// Update the user's token in mongo
		Meteor.users.update(user._id, {
			$push: {
				'services.resume.loginTokens': hashStampedToken
			}
    }); 
    return stampedToken;
  }
});
