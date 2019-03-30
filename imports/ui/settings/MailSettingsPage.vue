<template>
  <div class="administration-page">
    <template v-if="user">

    <v-subheader>{{ $t("Email notifications")}}</v-subheader>

    <v-list class="elevation-1">
      <v-list-tile @click="toggleTaskAssignedTo()">
        <v-list-tile-content>
          <v-list-tile-title>Une tâche m'est assignée</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch v-model="user.emailSettings.tasks.assignTo" @click="toggleTaskAssignedTo"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>


    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions"


export default {
  props: {
  },
  mounted() {
    Meteor.call("users.getEmailPreferences", (error, result) => {
      if (error) {
        this.$store.dispatch("notifyError", error);
        return;
      }
      this.user = result;
    })
  },

  data () {
    return {
      user: null
    }
  },
  methods: {
    toggleTaskAssignedTo() {
      this.user.emailSettings.tasks.assignTo = !this.user.emailSettings.tasks.assignTo;
      Meteor.call('users.updateEmailPreferences', this.user.emailSettings);
    }
  },
}
</script>

<style scoped>
</style>