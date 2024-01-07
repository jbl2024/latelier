<template>
  <div class="task-export">
    <generic-dialog
      v-model="showDialog"
      :title="$t('Export')"
      simple
    >
      <template v-slot:content>
        <v-progress-linear v-if="loading" indeterminate absolute top />
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
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { saveAs } from "file-saver";

export default {
  props: {
    taskId: {
      type: String,
      default: ""
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  methods: {
    async exportODT() {
      if (this.loading) return;
      this.loading = true;
      try {
        const result = await Meteor.callAsync("tasks.export", { taskId: this.taskId, format: "odt" });
        const blob = new Blob([result.data], { type: "application/vnd.oasis.opendocument.text" });
        saveAs(blob, "task.odt");
      } catch (error) {
        this.$notifyError(error);
      } finally {
        this.loading = false;
      }
    },

    async exportODS() {
      if (this.loading) return;

      try {
        this.loading = true;
        const result = await Meteor.callAsync("tasks.export", { taskId: this.taskId, format: "ods" });
        this.loading = false;

        const blob = new Blob([result.data], { type: "application/vnd.oasis.opendocument.spreadsheet" });
        saveAs(blob, "task.ods");
      } catch (error) {
        this.loading = false;
        this.$notifyError(error);
      } finally {
        this.loading = false;
      }
    },

    async exportXLSX() {
      if (this.loading) return;

      try {
        this.loading = true;
        const result = await Meteor.callAsync("tasks.export", { taskId: this.taskId, format: "xlsx" });
        const blob = new Blob([result.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "task.xlsx");
      } catch (error) {
        this.$notifyError(error);
      } finally {
        this.loading = false;
      }
    },

    async exportDOCX() {
      if (this.loading) return;
      this.loading = true;
      try {
        const result = await Meteor.callAsync("tasks.export", { taskId: this.taskId, format: "docx" });
        const blob = new Blob([result.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        saveAs(blob, "task.docx");
      } catch (error) {
        this.$notifyError(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
