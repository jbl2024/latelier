<template>
  <div class="new-process-diagram">
    <select-example :active.sync="showSelectExample" @select="selectExample" />
    <v-dialog
      v-model="showDialog"
      max-width="520"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card class="flex-container">
        <v-toolbar
          v-if="$vuetify.breakpoint.xsOnly"
          dark
          color="primary"
          class="flex0"
        >
          <v-btn icon text @click="close()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t("New process diagram") }}</span>
          </v-toolbar-title>
          <v-spacer />
          <v-toolbar-items>
            <v-btn v-if="!example" text dark @click="showSelectExample = true">
              {{ $t("Select template") }}
            </v-btn>
            <v-btn text dark :disabled="!valid" @click="create">
              {{ $t("Create") }}
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title v-if="!$vuetify.breakpoint.xsOnly" class="headline">
          {{ $t("New process diagram") }}
        </v-card-title>
        <v-divider />
        <v-card-text class="flex1">
          <v-form v-model="valid" class="pt-4" @submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-btn
                  v-if="example"
                  color="primary"
                  block
                  @click="clearExample"
                >
                  {{ $t("Clear template") }}
                </v-btn>
                <v-btn
                  v-if="!example"
                  color="primary"
                  block
                  @click="showSelectExample = true"
                >
                  {{ $t("Select template") }}
                </v-btn>
              </v-flex>
              <v-flex xs12 class="pb-4">
                <template v-if="!example">
                  <div class="template-label-empty">
                    {{ $t("No template") }}
                  </div>
                </template>
                <template v-if="example">
                  <div class="template-label">
                    {{ $t("Template:") }} {{ example.name }}
                  </div>
                </template>
              </v-flex>
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
                <rich-editor
                  ref="description"
                  v-model="description"
                  :max-height="!$vuetify.breakpoint.xsOnly ? '200px' : null"
                />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="!$vuetify.breakpoint.xsOnly">
          <v-spacer />
          <v-btn
            v-shortkey="['esc']"
            text
            @click="showDialog = false"
            @shortkey="close()"
          >
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

.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}
</style>
