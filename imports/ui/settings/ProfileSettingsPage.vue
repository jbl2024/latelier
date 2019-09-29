<template>
  <div>
    <template v-if="user">
      <v-subheader>{{ $t("Profile")}}</v-subheader>

      <div class="pa-8 elevation-1 card">
        <div class="center pa-8">
          <author-avatar big :user-id="user._id"></author-avatar>
        </div>
        <div class="center title">{{ user.emails[0].address }}</div>
        <div>
          <v-file-input label="File input"></v-file-input>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";
import get from "lodash/get";
import has from "lodash/has";
import set from "lodash/set";

export default {
  props: {},
  mounted() {
    this.refreshUser();
  },

  data() {
    return {
      user: null
    };
  },
  methods: {
    toggleSettings(property) {
      if (!has(this.user, property)) {
        set(this.user, property, false);
      }
      set(this.user, property, !get(this.user, property, false));
      Meteor.call("users.updateEmailPreferences", this.user.emailSettings);
      this.refreshUser();
    },

    refreshUser() {
      Meteor.call("users.getEmailPreferences", (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.user = result;
      });
    }
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  margin: 16px;
  max-width: 400px;
}
.title {
  font-size: 16px;
}
.center {
  text-align: center;
}
</style>