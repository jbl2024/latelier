<template>
  <div class="new-process-diagram">
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
            <span>{{ $t("New process diagram") }}</span>
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
          <v-btn color="primary" :disabled="!valid" @click="create">
            {{ $t("Create") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { autofocus } from "/imports/ui/autofocus";

export default {
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  i18n: {
    messages: {
      en: {
        "New process diagram": "New process diagram"
      },
      fr: {
        "New process diagram": "Nouveau diagramme"
      },
      oc: {
        "New process diagram": "Nòu diagrama"
      }
    }
  },
  data() {
    return {
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
    open() {
      this.showDialog = true;
      this.name = "";
      this.$nextTick(() => autofocus.focus(this.$refs.name));
    },
    close() {
      this.showDialog = false;
    },

    create() {
      this.showDialog = false;
      Meteor.call(
        "processDiagrams.create",
        {
          projectId: this.projectId,
          name: this.name,
          description: this.description
        },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$router.push({
            name: "project-bpmn-process-diagram",
            params: {
              projectId: this.projectId,
              processDiagramId: result
            }
          });
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped></style>
