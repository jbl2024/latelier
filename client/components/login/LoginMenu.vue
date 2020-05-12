<template>
  <div v-if="isConnected" class="login-menu">
    <v-list class="pt-0">
      <v-list-item v-if="isAdmin" :to="{ name: 'administration-page' }">
        <v-list-item-action>
          <v-icon>mdi-shield-check</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Administration</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{ name: 'profile-settings-page' }">
        <v-list-item-action>
          <v-icon>mdi-account-circle-outline</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t("Profile") }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="$store.dispatch('showSelectBackgroundDialog', true)">
        <v-list-item-action>
          <v-icon>mdi-image-multiple</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t("Background") }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{ name: 'mail-settings-page' }">
        <v-list-item-action>
          <v-icon>mdi-email</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ $t("Email notifications") }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list-item @click="logout()">
        <v-list-item-action>
          <v-icon>mdi-exit-to-app</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t("login.logout") }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["isConnected", "isAdmin"])
  },
  methods: {
    logout() {
      this.$confirm(this.$t("login.logoutConfirm"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("login.logout")
      }).then((res) => {
        if (res) {
          Meteor.call("users.getRedirectUrlAfterLogout", (error, url) => {
            if (error) {
              this.$notifyError(error);
            }
            Meteor.logout((err) => {
              if (err) {
                this.$notifyError(err);
              }
              if (url) {
                window.location = url;
              }
            });
          });
        }
      });
    }
  }
};
</script>
