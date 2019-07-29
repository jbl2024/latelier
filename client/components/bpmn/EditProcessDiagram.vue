<template>
  <div class="edit-process-diagram">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t('Edit process diagram') }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="name" ref="name" :rules="nameRules" :label="$t('Name')" required></v-text-field>
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
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams.js";

export default {
  i18n: {
    messages: {
      en: {
        "Edit process diagram": "Edit process diagram"
      },
      fr: {
        "Edit process diagram": "Editer le diagramme"
      }
    }
  },
  data() {
    return {
      processDiagram: {},
      showDialog: false,
      valid: false,
      name: "",
      nameRules: [
        v => !!v || this.$t('Name is mandatory'),
        v => v.length > 1 || this.$t('Name is too short')
      ],
      description: ""
    };
  },
  methods: {
    open(processDiagram) {
      this.processDiagram = processDiagram;
      this.name = this.processDiagram.name;
      this.description = this.processDiagram.description
      this.showDialog = true;
      this.$nextTick(() => this.$refs.name.focus());
    },
    close() {
      this.showDialog = false;
    },

    update() {
      this.showDialog = false;
      Meteor.call(
        "processDiagrams.update",
        {
          processDiagramId: this.processDiagram._id,
          name: this.name,
          description: this.description
        },
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