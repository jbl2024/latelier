<template>
  <v-card class="user-detail">
      <v-card-title>
        <span class="headline">{{ user.profile.firstName}} {{ user.profile.lastName }}</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout wrap="">
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
        <v-btn flat @click.native="save()">Changer le mot de passe</v-btn>
        <v-btn flat @click.native="deactivate()" v-if="isActive(user)">Désactiver</v-btn>
        <v-btn flat @click.native="activate()" v-if="!isActive(user)">Activer</v-btn>
        <v-btn color="primary" @click.native="save()">Mettre à jour</v-btn>
      </v-card-actions>
  </v-card>
</template>

<script>
import { Permissions } from '/imports/api/users/permissions'

export default {
  props: {
    user: {
      type: Object,
      dialog: Boolean
    }
  },
  data() {
    return {};
  },
  methods: {
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
    }
  }
};
</script>

<style scoped>
</style>