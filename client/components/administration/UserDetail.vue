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
          <v-list-tile v-if="!isMe(user)" @click="showConfirmDeleteUserDialog = true">
            <v-list-tile-title>Supprimer</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-card-text>
      <v-container grid-list-md>
        <v-layout wrap="">
          <v-flex xs12 sm6 md6>
            <v-switch v-if="!isMe(user)" :label="`${isActive ? 'Compte activé' : 'Compte déactivé'}`" v-model="isActive"></v-switch>
          </v-flex>
          <v-flex xs12 sm6 md6>
            <v-switch v-if="!isMe(user)" :label="`${isConfirmed ? 'Mail confirmé' : 'Mail non confirmé'}`" v-model="isConfirmed"></v-switch>
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
  props: {
    user: {
      type: Object,
      dialog: Boolean
    }
  },
  data() {
    return {
      showConfirmDeleteUserDialog: false,
      isActive: false,
      isConfirmed: false
    };
  },
  watch: {
    user: {
      immediate: true,
      handler(user) {
        this.isActive = Permissions.isActive(user);
        this.isConfirmed = user.emails[0].verified;
      }
    },
    isActive(active, prevValue) {
      if (active != prevValue) {
        if (active) {
          this.activate();
        } else {
          this.deactivate();
        }
      }
    },
    isConfirmed(confirmed, prevValue) {
      if (confirmed != prevValue) {
        if (confirmed) {
          this.confirm();
        } else {
          this.unconfirm();
        }
      }
    }
  },
  methods: {
    isMe(user) {
      return user._id == Meteor.userId();
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

    confirm() {
      Meteor.call("admin.confirmEmail", this.user._id);
      this.$emit("saved");
      this.$emit("close");
    },

    unconfirm() {
      Meteor.call("admin.unconfirmEmail", this.user._id);
      this.$emit("saved");
      this.$emit("close");
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