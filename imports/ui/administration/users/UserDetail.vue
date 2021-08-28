<template>
  <v-card v-if="user" class="user-detail">
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
        <span>{{ user.profile.firstName }} {{ user.profile.lastName }}</span>
      </v-toolbar-title>
      <v-spacer />
      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-if="!isMe()"
            @click="showConfirmDeleteUserDialog = true"
          >
            <v-list-item-title>{{ $t("Delete") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-card-text>
      <v-form v-model="valid" class="form" @submit.prevent>
        <v-container grid-list-md>
          <v-layout wrap="">
            <v-flex xs12 sm4 md4>
              <v-switch
                v-if="!isMe()"
                v-model="user.features.isActive"
                color="accent"
                :label="`${
                  user.features.isActive
                    ? $t('Account activated')
                    : $t('Account deactivated')
                }`"
              />
            </v-flex>
            <v-flex xs12 sm4 md4>
              <v-switch
                v-if="!isMe()"
                v-model="user.features.emailVerified"
                color="accent"
                :label="`${
                  user.features.emailVerified
                    ? $t('Confirmed email')
                    : $t('Unconfirmed email')
                }`"
              />
            </v-flex>
            <v-flex xs12 sm4 md4>
              <v-switch
                v-if="!isMe()"
                v-model="user.features.isAdmin"
                color="accent"
                :label="$t('Admin rights')"
              />
            </v-flex>
            <v-flex xs12 sm6 md6>
              <v-text-field
                v-model="user.profile.firstName"
                :label="$t('First name')"
                required
              />
            </v-flex>
            <v-flex xs12 sm6 md6>
              <v-text-field
                v-model="user.profile.lastName"
                :label="$t('Last name')"
                required
              />
            </v-flex>
            <v-flex v-if="user.emails" xs12>
              <v-text-field
                v-model="user.emails[0].address"
                :label="$t('Email')"
                :rules="emailRules"
                required
              />
            </v-flex>
            <v-flex xs12 sm6 md6>
              <v-text-field
                v-model="user.password"
                label="New password"
                type="password"
              />
            </v-flex>
            <v-flex xs12 sm6 md6>
              <v-text-field
                v-model="user.passwordConfirmation"
                label="New password (confirmation)"
                type="password"
              />
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click.native="close()">
        {{ $t("Close") }}
      </v-btn>
      <v-btn color="primary" :disabled="!valid" @click.native="save()">
        {{ $t("Update") }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  i18n: {
    messages: {
      en: {
        "Admin rights": "Admin rights",
        "User updated": "User updated"
      },
      fr: {
        "Admin rights": "Droits admin",
        "User updated": "Utilisateur mis à jour"
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
      user: null,
      showConfirmDeleteUserDialog: false
    };
  },
  methods: {
    isMe() {
      return this.user._id === Meteor.userId();
    },
    open(user) {
      this.user = user;
    },
    close() {
      this.$emit("close");
    },
    save() {
      Meteor.call("admin.updateUser", this.user, (error) => {
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.$notify(this.$t("User updated"));
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
