<template>
  <div class="administration-page">
    <template v-if="user">

    <v-subheader>{{ $t("Email notifications")}}</v-subheader>

    <v-list class="elevation-1">
      <v-list-tile @click="toggleSettings('emailSettings.tasks.assignTo')">
        <v-list-tile-content>
          <v-list-tile-title>{{ $t("A task is assigned to me") }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch v-model="user.emailSettings.tasks.assignTo" @click="toggleSettings('emailSettings.tasks.assignTo')"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
      <v-list-tile @click="toggleSettings('emailSettings.tasks.update')">
        <v-list-tile-content>
          <v-list-tile-title>{{ $t("A task is updated") }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch v-model="user.emailSettings.tasks.update" @click="toggleSettings('emailSettings.tasks.update')"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>


    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions"
import get from "lodash/get";
import has from "lodash/has";
import set from "lodash/set";


export default {
  i18n: {
    messages: {
      "en": {
        "A task is assigned to me": "A task is assigned to me",
        "A task is updated": "A task is updated",
      },
      "fr": {
        "A task is assigned to me": "Une tâche m'est assignée",
        "A task is updated": "Une tâche est modifiée",
      }
    }
  },
  props: {
  },
  mounted() {
    this.refreshUser();
  },

  data () {
    return {
      user: null
    }
  },
  methods: {
    toggleSettings(property) {
      if (!has(this.user, property)) {
        set(this.user, property, false);
      }
      set(this.user, property, !get(this.user, property, false));
      Meteor.call('users.updateEmailPreferences', this.user.emailSettings);
      this.refreshUser();
    },

    refreshUser() {
      Meteor.call("users.getEmailPreferences", (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.user = result;
      })
    }
  },
}
</script>

<style scoped>
</style>