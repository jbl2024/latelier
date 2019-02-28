<template>
  <div class="edit-database">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card v-if="database">
        <v-toolbar dark color="primary">
          <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t('Edit database') }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="name" ref="name" :rules="nameRules" label="Nom" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <label>{{ $t('Description') }}</label>
                <rich-editor v-model="description" ref="description"></rich-editor>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="showDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="update" :disabled="!valid">{{ $t('Update') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Databases } from "/imports/api/databases/databases.js";

export default {
  props: {
    database: {
      type: Object
    }
  },
  i18n: {
    messages: {
      en: {
        "Edit database": "Edit database",
      },
      fr: {
        "Edit database": "Editer la base de données",
      }
    }
  },
  data() {
    return {
      showDialog: false,
      valid: false,
      name: "",
      nameRules: [
        v => !!v || "Le nom est obligatoire",
        v => (v && v.length > 1) || "Le nom est trop court"
      ],
      description: "",
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => {
        this.name = this.database.name;
        this.description = this.database.description;
        this.$refs.name.focus();
      });
    },
    close() {
      this.showDialog = false;
    },
    update() {
      this.showDialog = false;
      Meteor.call(
        "databases.update",
        this.database._id,
        this.name,
        this.description,
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
</style>