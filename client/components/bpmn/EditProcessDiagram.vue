<template>
  <div class="edit-process-diagram">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
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
            <span>{{ $t("Edit process diagram") }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  ref="name"
                  v-model="name"
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                />
              </v-flex>
              <v-flex xs12>
                <label>{{ $t("Description") }}</label>
                <rich-editor ref="description" v-model="description" />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn color="primary" :disabled="!valid" @click="update">
            {{ $t("Update") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

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
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ],
      description: ""
    };
  },
  methods: {
    open(processDiagram) {
      this.processDiagram = processDiagram;
      this.name = this.processDiagram.name;
      this.description = this.processDiagram.description;
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
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped></style>
