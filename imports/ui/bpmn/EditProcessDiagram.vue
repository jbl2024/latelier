<template>
  <div class="edit-process-diagram">
    <generic-dialog
      v-model="showDialog"
      max-width="520"
      :title="$t('Edit process diagram')"
    >
      <template v-slot:content>
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
              <rich-editor
                ref="description"
                v-model="description"
                :max-height="!$vuetify.breakpoint.xsOnly ? '200px' : null"
              />
            </v-flex>
          </v-layout>
        </v-form>
      </template>
      <template v-slot:actions>
        <v-btn text :disabled="!valid" @click="update">
          {{ $t("Update") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { autofocus } from "/imports/ui/autofocus";

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
      this.$nextTick(() => autofocus.focus(this.$refs.name));
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
            this.$notifyError(error);
          }
        }
      );
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
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
