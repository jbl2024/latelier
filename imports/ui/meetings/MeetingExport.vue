<template>
  <generic-dialog v-model="showDialog" :title="$t('Export')" simple>
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
      </v-list>
    </template>
  </generic-dialog>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { saveAs } from "file-saver";

export default {
  props: {
    meetingId: {
      type: String,
      default: null
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
    exportODT() {
      if (this.loading) return;
      this.loading = true;
      Meteor.call(
        "meetings.export",
        { meetingId: this.meetingId, format: "odt" },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type: "application/vnd.oasis.opendocument.text"
          });
          saveAs(blob, "meeting.odt");
        }
      );
    },

    exportDOCX() {
      if (this.loading) return;
      this.loading = true;
      Meteor.call(
        "meetings.export",
        { meetingId: this.meetingId, format: "docx" },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          });
          saveAs(blob, "meeting.docx");
        }
      );
    }
  }
};
</script>
