<template>

<div class="author-line">
    <v-avatar size="24" :class="isOnline(userId)">
        <span>{{ formatUserLetters(userId) }}</span>
    </v-avatar>
    <span>{{ formatUser(userId)}} {{ formatDateDuration(date) }} ({{ formatDate(date) }})</span>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import moment from 'moment';
import 'moment/locale/fr'

export default {
  mixins: [usersMixin],
  props: {
    userId: {
      type: String
    },
    date: {
      type: Date
    }
  },
  data() {
    return {
    };
  },
  methods: {
    formatDateDuration (date) {
      var now = moment();
      var noteDate = moment(date);
      var duration = moment.duration(now.diff(noteDate)).locale('fr');
      return 'il y a ' + duration.humanize();
    },

    formatDate (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },

    formatUser (userId) {
      if (!userId) {
        return '';
      }
      var user = Meteor.users.findOne({_id: userId});
      return user.emails[0].address;
    },

    formatUserLetters (userId) {
      if (!userId) {
        return '';
      }
      var user = Meteor.users.findOne({_id: userId});
      var emailComponents = user.emails[0].address.split('@');
      return emailComponents[0][0] + emailComponents[1][0];
    }
  }
};
</script>

<style scoped>

</style>