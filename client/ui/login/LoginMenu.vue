<template>

<div class="login-menu">
    <confirm-dialog
      :active.sync="showConfirmDialog"
      title="Confirmer la déconnexion ?"
      content="Voulez vous vous déconnecter ?"
      confirm-text="Se déconnecter"
      cancel-text="Annuler"
      @cancel="onCancelLogout"
      @confirm="onConfirmLogout"
    />

    <template v-if="!isConnected">
      <v-list dense class="pt-0">
        <v-list-tile :to="{ name: 'login'}">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Se connecter</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ name: 'register'}">
          <v-list-tile-action>
            <v-icon>person_add</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Créer un compte</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :to="{ name: 'forgot-password'}">
          <v-list-tile-action>
            <v-icon>security</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Mot de passe perdu</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </template>
    <template v-if="isConnected && $subReady.user">
      <v-divider></v-divider>
      <v-list dense class="pt-0" v-if="isAdmin()">
        <v-list-tile @click="showConfirmDialog = true">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Administration</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list dense class="pt-0">
        <v-list-tile @click="showConfirmDialog = true">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Se déconnecter</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </template>
</div>

</template>

<script>
export default {
  data() {
    return {
      showConfirmDialog: false
    };
  },
  meteor: {
    isConnected () {
      if (Meteor) {
        return Meteor.userId();
      }
      return false;
    },
    $subscribe: {
      user: function() {
        return [];
      }
    },

  },
  methods: {
    logout () {
      Meteor.logout();
    },

    onCancelLogout () {
      showConfirmDialog = false;
    },

    onConfirmLogout () {
      showConfirmDialog = false;
      this.logout();
    },

    isAdmin () {
      if (Roles.userIsInRole(Meteor.userId(), 'admin', Roles.GLOBAL_GROUP)) {
        return true;
      }
      return false;
    }
  }
};
</script>

<style scoped>
</style>