<template>
  <v-card class="user-detail" v-if="user">
    <confirm-dialog
      :active.sync="showConfirmDeleteUserDialog"
      title="Confirmer la suppression ?"
      content="L'utilisateur sera définitivement supprimé"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      @cancel="onCancelDeleteUser"
      @confirm="onConfirmDeleteUser"
    />
    <v-toolbar dark color="primary">
      <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
        <v-icon>close</v-icon>
      </v-btn>
      <v-toolbar-title>
        <span>{{ user.profile.firstName}} {{ user.profile.lastName }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <v-btn slot="activator" icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile v-if="!isMe()" @click="showConfirmDeleteUserDialog = true">
            <v-list-tile-title>{{ this.$t('Delete') }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap="">
          <v-flex xs12 sm4 md4>
            <v-switch v-if="!isMe()" :label="`${user.features.isActive ? 'Compte activé' : 'Compte déactivé'}`" v-model="user.features.isActive"></v-switch>
          </v-flex>
          <v-flex xs12 sm4 md4>
            <v-switch v-if="!isMe()" :label="`${user.features.emailVerified ? 'Mail confirmé' : 'Mail non confirmé'}`" v-model="user.features.emailVerified"></v-switch>
          </v-flex>
          <v-flex xs12 sm4 md4>
            <v-switch v-if="!isMe()" :label="$t('Admin rights')" v-model="user.features.isAdmin"></v-switch>
          </v-flex>
          <v-flex xs12>
            <v-divider></v-divider>
          </v-flex>
          
          <v-flex xs12 sm6 md6>
            <v-text-field label="Prénom*" required v-model="user.profile.firstName"></v-text-field>
          </v-flex>
          <v-flex xs12 sm6 md6>
            <v-text-field label="Nom*" v-model="user.profile.lastName" required></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-text-field label="Email*" required v-model="user.emails[0].address"></v-text-field>
          </v-flex>
        </v-layout>
      </v-container>
      <small>*indique un champ obligatoire</small>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn flat @click.native="close()">Fermer</v-btn>
      <v-btn color="primary" @click.native="save()">Mettre à jour</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";


export default {
  i18n: {
    messages: {
      en: {
        "Admin rights": "Admin rights",
        "User updated": "User updated",
      },
      fr: {
        "Admin rights": "Droits admin",
        "User updated": "Utilisateur mis à jour",
      }
    }
  },
  data() {
    return {
      user: null,
      showConfirmDeleteUserDialog: false,
    };
  },
  methods: {
    isMe() {
      return this.user._id == Meteor.userId();
    },
    open(user) {
      this.user = user;
    },
    close() {
      this.$emit("close");
    },
    save() {
      Meteor.call("admin.updateUser", this.user, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t('User updated'));
        this.$emit("saved");
        this.$emit("close");
      });
    },

    onCancelDeleteUser() {},

    onConfirmDeleteUser() {
      Meteor.call("admin.removeUser", this.user._id);
      this.$emit("saved");
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
.deactivated {
  font-weight: bold;
}
</style>