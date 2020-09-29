<template>
  <generic-dialog v-model="showDialog" :title="$t('Export')" simple>
    <template v-slot:content>
      <v-progress-linear v-if="loading" indeterminate absolute top />
      <v-list>
        <v-list-item @click="exportAs('odt')">
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

        <v-list-item @click="exportAs('docx')">
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

mimeTypes = {
  odt: "application/vnd.oasis.opendocument.text",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

export default {
  props: {
    meeting: {
      type: Object,
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
    exportAs(format) {
      if (this.loading) return;
      this.loading = true;
      Meteor.call(
        "meetings.export",
        { meetingId: this.meeting._id, format },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type: mimeTypes[format]
          });
          saveAs(blob, `${this.meeting.name}.${format}`);
        }
      );
    }
  }
};
</script>
