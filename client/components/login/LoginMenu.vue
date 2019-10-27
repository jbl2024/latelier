<template>
  <div class="login-menu">
    <template v-if="!isConnected">
      <v-list class="pt-0">
        <v-list-item :to="{ name: 'login' }">
          <v-list-item-action>
            <v-icon>mdi-account</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Se connecter</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'register' }">
          <v-list-item-action>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Créer un compte</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="{ name: 'forgot-password' }">
          <v-list-item-action>
            <v-icon>mdi-security</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Mot de passe perdu</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
    <template v-if="isConnected && $subReady.user">
      <v-divider />
      <v-list class="pt-0">
        <v-list-item :to="{ name: 'dashboard-page' }">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t("Dashboard") }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list v-if="isAdmin()" class="pt-0">
        <v-list-item :to="{ name: 'administration-page' }">
          <v-list-item-action>
            <v-icon>mdi-shield-check</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Administration</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list class="pt-0">
        <v-list-item
          @click="$store.dispatch('showSelectBackgroundDialog', true)"
        >
          <v-list-item-action>
            <v-icon>mdi-image-multiple</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t("Background") }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item :to="{ name: 'profile-settings-page' }">
          <v-list-item-action>
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t("Profile") }}</v-list-item-title>
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
        <v-list-item @click="logout()">
          <v-list-item-action>
            <v-icon>mdi-exit-to-app</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ $t("Log out") }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";

export default {
  i18n: {
    messages: {
      en: {
        Background: "Background",
        "Log out": "Log out",
        "Do you want to log out?": "Do you want to log out?"
      },
      fr: {
        Background: "Fond d'écran",
        "Log out": "Se déconnecter",
        "Do you want to log out?": "Voulez-vous vous déconnecter ?"
      }
    }
  },
  data() {
    return {};
  },
  meteor: {
    isConnected() {
      if (Meteor) {
        return Meteor.userId();
      }
      return false;
    },
    $subscribe: {
      user() {
        return [];
      }
    }
  },

  methods: {
    logout() {
      this.$confirm(this.$t("Do you want to log out?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Log out")
      }).then((res) => {
        if (res) {
          Meteor.logout();
        }
      });
    },

    isAdmin() {
      return Permissions.isAdmin(Meteor.userId());
    }
  }
};
</script>

<style scoped></style>
