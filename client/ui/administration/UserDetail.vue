<template>
  <v-card class="user-detail">
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
            <v-list-tile v-if="!isMe(user) && !isActive(user)" @click="activate()">
              <v-list-tile-title>Activer</v-list-tile-title>
            </v-list-tile>
            <v-list-tile v-if="!isMe(user) &&  isActive(user)" @click="deactivate()">
              <v-list-tile-title>Désactiver</v-list-tile-title>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile v-if="!isMe(user)" @click="showConfirmDeleteUserDialog = true">
              <v-list-tile-title>Supprimer</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>    
    <v-card-title>
      <span v-if="isActive(user)">Compte activé</span>
      <span v-if="!isActive(user)" class="deactivated">Compte désactivé</span>
    </v-card-title>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap>
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
import { Permissions } from "/imports/api/users/permissions";

export default {
  props: {
    user: {
      type: Object,
      dialog: Boolean
    }
  },
  data() {
    return {
      showConfirmDeleteUserDialog: false,
    };
  },
  methods: {
    isMe (user) {
      return user._id == Meteor.userId()
    },
    
    isActive(user) {
      return Permissions.isActive(user);
    },

    close() {
      this.$emit("close");
    },
    save() {
      Meteor.call("admin.updateUser", this.user);
      this.$emit("saved");
      this.$emit("close");
    },

    deactivate() {
      Meteor.call("admin.deactivateUser", this.user._id);
      this.$emit("saved");
      this.$emit("close");
    },

    activate() {
      Meteor.call("admin.activateUser", this.user._id);
      this.$emit("saved");
      this.$emit("close");
    },

    onCancelDeleteUser () {

    },

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