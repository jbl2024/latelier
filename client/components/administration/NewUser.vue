<template>
  <v-dialog
    v-model="showDialog"
    class="detail"
    max-width="640"
    :fullscreen="$vuetify.breakpoint.xsOnly"
  >
    <v-card class="new-user">
      <v-toolbar dark color="primary">
        <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>
          <span>{{ $t('New user') }}</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="valid" class="form" v-on:submit.prevent>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md6>
                <v-switch
                  :label="`${user.isActive ? 'Compte activé' : 'Compte déactivé'}`"
                  v-model="user.isActive"
                ></v-switch>
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-switch
                  :label="`${user.isConfirmed ? 'Mail confirmé' : 'Mail non confirmé'}`"
                  v-model="user.isConfirmed"
                ></v-switch>
              </v-flex>
              <v-flex xs12>
                <v-divider></v-divider>
              </v-flex>

              <v-flex xs12 sm6 md6>
                <v-text-field label="Prénom" v-model="user.profile.firstName"></v-text-field>
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field label="Nom" v-model="user.profile.lastName"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Email*" required :rules="emailRules" v-model="user.email"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <small>*indique un champ obligatoire</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click.native="close()">Fermer</v-btn>
        <v-btn color="primary" @click.native="create()" :disabled="!valid">{{ $t('Create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Permissions } from "/imports/api/users/permissions";

export default {
  props: {},
  i18n: {
    messages: {
      en: {
        "New user": "New user",
      },
      fr: {
        "New user": "Nouvel utilisateur",
      }
    }
  },
  data() {
    return {
      valid: false,
      emailRules: [
        v => !!v || "Email obligatoire",
        v => (v.length > 1 && v.indexOf('@') > -1) || "Email invalide"
      ],
      showDialog: false,
      user: {
        profile: {
          firstName: '',
          lastName: '',
        },
        email: '',
        isActive: true,
        isConfirmed: true
      },
    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    create() {
      Meteor.call("admin.addUser", this.user, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.close();
        this.$emit("created");
      });
    }
  }
};
</script>

<style scoped>
.deactivated {
  font-weight: bold;
}
</style>