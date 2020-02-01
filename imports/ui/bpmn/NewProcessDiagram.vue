<template>
  <div class="new-process-diagram">
    <select-example :active.sync="showSelectExample" @select="selectExample" />
    <v-dialog
      v-model="showDialog"
      max-width="520"
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
              <v-flex xs12>
                <template v-if="!example">
                  <div class="template-label-empty">
                    {{
                      $t("No template")
                    }}
                  </div>
                </template>
                <template v-if="example">
                  <div class="template-label">
                    {{ $t("Template:") }} {{ example.name }}
                  </div>
                </template>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="example" text @click="clearExample">
            {{ $t("Clear template") }}
          </v-btn>
          <v-btn v-if="!example" text @click="showSelectExample = true">
            {{ $t("Select template") }}
          </v-btn>
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
import SelectExample from "/imports/ui/bpmn/examples/SelectExample";

export default {
  components: {
    SelectExample
  },
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
      showSelectExample: false,
      valid: false,
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ],
      description: "",
      example: null
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
          description: this.description,
          xml: this.example ? this.example.xml : null
        },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
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
    },

    selectExample(example) {
      this.example = example;
    },

    clearExample() {
      this.example = null;
    }
  }
};
</script>

<style scoped>
.template-label {
  font-size: 14px;
  margin-top: 12px;
  font-weight: bold;
  color: black;
}

.template-label-empty {
  font-size: 14px;
  margin-top: 12px;
}
</style>
