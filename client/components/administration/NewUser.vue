<template>
  <v-dialog
    v-model="showDialog"
    class="detail"
    max-width="640"
    :fullscreen="$vuetify.breakpoint.xsOnly"
  >
    <v-card class="new-user">
      <v-toolbar dark color="primary">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="close()"
          @shortkey="close()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          <span>{{ $t("New user") }}</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="valid" class="form" @submit.prevent>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md6>
                <v-switch
                  v-model="user.isActive"
                  :label="
                    `${user.isActive ? 'Compte activé' : 'Compte déactivé'}`
                  "
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-switch
                  v-model="user.isConfirmed"
                  :label="
                    `${
                      user.isConfirmed ? 'Mail confirmé' : 'Mail non confirmé'
                    }`
                  "
                />
              </v-flex>
              <v-flex xs12>
                <v-divider />
              </v-flex>

              <v-flex xs12 sm6 md6>
                <v-text-field v-model="user.profile.firstName" label="Prénom" />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  v-model="user.profile.lastName"
                  :label="$t('Name')"
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="user.email"
                  label="Email*"
                  required
                  :rules="emailRules"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <small>*indique un champ obligatoire</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="close()">
          {{ this.$t("Close") }}
        </v-btn>
        <v-btn color="primary" :disabled="!valid" @click.native="create()">
          {{ $t("Create") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {},
  i18n: {
    messages: {
      en: {
        "New user": "New user",
        "User created": "User created"
      },
      fr: {
        "New user": "Nouvel utilisateur",
        "User created": "Utilisateur crée"
      }
    }
  },
  data() {
    return {
      valid: false,
      emailRules: [
        (v) => !!v || this.$t("Email is mandatory"),
        (v) => (v.length > 1 && v.indexOf("@") > -1) || this.$t("Invalid email")
      ],
      showDialog: false,
      user: {
        profile: {
          firstName: "",
          lastName: ""
        },
        email: "",
        isActive: true,
        isConfirmed: true
      }
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
      Meteor.call("admin.addUser", this.user, (error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.$store.dispatch("notify", this.$t("User created"));

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
