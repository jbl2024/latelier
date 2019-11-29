<template>
  <div class="task-export">
    <v-dialog
      :value="active"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      max-width="420"
      @input="$emit('update:active')"
    >
      <v-card>
        <v-card-title class="headline">
          {{ $t("Export") }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-list>
            <v-list-item @click="exportODT()">
              <v-list-item-avatar>
                <v-icon class="blue white--text">
                  mdi-file-document-box-outline
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  ODT
                </v-list-item-title>
                <v-list-item-subtitle>
                  OpenDocument Format - LibreOffice
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-avatar>
                <v-icon class="blue white--text">
                  mdi-google-spreadsheet
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  ODS
                </v-list-item-title>
                <v-list-item-subtitle>
                  OpenDocument Format - LibreOffice
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn v-shortkey="['esc']" text @click="close()" @shortkey="close()">
            {{ this.$t("Close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
  props: {
    taskId: {
      type: String,
      default: ""
    },
    active: Boolean
  },
  data() {
    return {
    };
  },
  methods: {
    close() {
      this.$emit("update:active", false);
    },

    exportODT() {
      Meteor.call("tasks.exportODT", { taskId: this.taskId }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        const blob = new Blob([result.data], { type: "application/vnd.oasis.opendocument.text" });
        saveAs(blob, "task.odt");
      });
    }
  }
};
</script>

<style scoped>
</style>
