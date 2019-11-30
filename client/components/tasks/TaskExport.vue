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
                  OpenDocument Format - LibreOffice Writer
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="exportODS()">
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
                  OpenDocument Format - LibreOffice Calc
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="exportDOCX()">
              <v-list-item-avatar>
                <v-icon class="green white--text">
                  mdi-file-document-box-outline
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  DOCX
                </v-list-item-title>
                <v-list-item-subtitle>
                  Word
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="exportXLSX()">
              <v-list-item-avatar>
                <v-icon class="green white--text">
                  mdi-google-spreadsheet
                </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  XLSX
                </v-list-item-title>
                <v-list-item-subtitle>
                  Excel
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
      Meteor.call("tasks.export", { taskId: this.taskId, format: "odt" }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        const blob = new Blob([result.data], { type: "application/vnd.oasis.opendocument.text" });
        saveAs(blob, "task.odt");
      });
    },

    exportODS() {
      Meteor.call("tasks.export", { taskId: this.taskId, format: "ods" }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        const blob = new Blob([result.data], { type: "application/vnd.oasis.opendocument.spreadsheet" });
        saveAs(blob, "task.ods");
      });
    },

    exportXLSX() {
      Meteor.call("tasks.export", { taskId: this.taskId, format: "xlsx" }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        const blob = new Blob([result.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "task.xlsx");
      });
    },

    exportDOCX() {
      Meteor.call("tasks.export", { taskId: this.taskId, format: "docx" }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        const blob = new Blob([result.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        saveAs(blob, "task.docx");
      });
    }
  }
};
</script>

<style scoped>
</style>
