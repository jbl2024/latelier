<template>
  <div class="administration-page">
    <template v-if="user">
      <v-subheader>{{ $t("Email notifications") }}</v-subheader>

      <v-list class="elevation-1">
        <v-list-item @click="toggleSettings('emailSettings.tasks.assignTo')">
          <v-list-item-content>
            <v-list-item-title>
              {{ $t("A task is assigned to me") }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-switch
              v-model="user.emailSettings.tasks.assignTo"
              color="accent"
              @click="toggleSettings('emailSettings.tasks.assignTo')"
            />
          </v-list-item-action>
        </v-list-item>
        <v-list-item @click="toggleSettings('emailSettings.tasks.update')">
          <v-list-item-content>
            <v-list-item-title>{{ $t("A task is updated") }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-switch
              v-model="user.emailSettings.tasks.update"
              color="accent"
              @click="toggleSettings('emailSettings.tasks.update')"
            />
          </v-list-item-action>
        </v-list-item>
        <v-list-item @click="toggleSettings('emailSettings.digests.daily')">
          <v-list-item-content>
            <v-list-item-title>{{ $t("Daily digest from subscribed projects") }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-switch
              v-model="user.emailSettings.digests.daily"
              color="accent"
              @click="toggleSettings('emailSettings.digests.daily')"
            />
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script>
import get from "lodash/get";
import has from "lodash/has";
import set from "lodash/set";

export default {
  props: {},

  data() {
    return {
      user: null
    };
  },
  mounted() {
    this.refreshUser();
  },
  methods: {
    async toggleSettings(property) {
      if (!has(this.user, property)) {
        set(this.user, property, false);
      }

      try {
        await Meteor.callAsync("users.updateEmailPreferences", this.user.emailSettings);
        await this.refreshUser();
      } catch (error) {
        this.$notifyError(error.message);
      }

      set(this.user, property, !get(this.user, property, false));
    },

    async refreshUser() {
      try {
        const result = await Meteor.callAsync("users.getEmailPreferences");
        this.user = result;
      } catch (error) {
        this.$notifyError(error);
      }
    }
  }
};
</script>

<style scoped></style>
