<template>
  <div class="tasks-export">
    <generic-dialog v-model="showDialog" :title="$t('Export')" simple>
      <template v-slot:content>
        <v-progress-linear v-if="loading" indeterminate absolute top />
        <v-list>
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
    projectId: {
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
    exportODS() {
      if (this.loading) return;
      this.loading = true;
      Meteor.call(
        "tasks.exportProject",
        { projectId: this.projectId, format: "ods" },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type: "application/vnd.oasis.opendocument.spreadsheet"
          });
          saveAs(blob, "task.ods");
        }
      );
    },

    exportXLSX() {
      if (this.loading) return;
      this.loading = true;
      Meteor.call(
        "tasks.exportProject",
        { projectId: this.projectId, format: "xlsx" },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
          saveAs(blob, "task.xlsx");
        }
      );
    }
  }
};
</script>
