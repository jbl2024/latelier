<template>
  <v-avatar size="40" :class="isOnline(userId)">
    <span>{{ formatUserLetters(userId) }}</span>
  </v-avatar>
</template>

<script>
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

import moment from "moment";
import "moment/locale/fr";

export default {
  mixins: [usersMixin],
  props: {
    userId: {
      type: String
    }
  },
  methods: {
    formatUser(userId) {
      if (!userId) {
        return "";
      }
      var user = Meteor.users.findOne({ _id: userId });
      return user.emails[0].address;
    },

    formatUserLetters(userId) {
      if (!userId) {
        return "";
      }
      var user = Meteor.users.findOne({ _id: userId });
      var emailComponents = user.emails[0].address.split("@");
      return emailComponents[0][0] + emailComponents[1][0];
    }
  }
};
</script>
