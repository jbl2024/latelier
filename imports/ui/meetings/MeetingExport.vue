<template>
  <generic-dialog v-model="showDialog" :title="$t('Export')" simple>
    <template v-slot:content>
      <v-progress-linear v-if="loading" indeterminate absolute top />
      <v-list>
        <v-list-item 
          v-for="format in formats" 
          :key="format.format" 
          @click="exportAs(format.format, format)">
          <v-list-item-avatar>
            <v-icon :class="[format.color, 'white--text']">
              {{ format.icon ? format.icon : 'mdi-file-document-box-outline' }}
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ format.title }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="format.description">
              {{ format.description }}
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
import { sanitizeForFs } from "/imports/ui/utils/sanitize";

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
      loading: false,
      formats: Object.freeze([
        {
          format: "pdf",
          title: "PDF",
          description: "Portable Document Format",
          color: "red",
          mimeType: "application/pdf"
        },
        {
          format: "odt",
          title: "ODT",
          description: "OpenDocument Format - LibreOffice Writer",
          color: "blue",
          mimeType: "application/vnd.oasis.opendocument.text"
        },
        {
          format: "docx",
          title: "DOCX",
          description: "Word",
          color: "green",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
        {
          format: "pdf",
          title: "PDF (Preview)",
          description: "Portable Document Format",
          color: "red",
          previewOnly: true,
          mimeType: "application/pdf"
        },
      ])
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
    findFormat(format) {
      return this.formats.find(f => f.format === format);
    },
    exportAs(format, options = {}) {
      const foundFormat = this.findFormat(format);
      if (this.loading || !foundFormat) return;
      this.loading = true;
      Meteor.call(
        "meetings.export",
        {
          meetingId: this.meeting._id,
          locale: this.$i18n.locale,
          format
        },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          const blob = new Blob([result.data], {
            type: foundFormat.mimeType
          });

          if (options.previewOnly === true) {
            var blobURL = URL.createObjectURL(blob);
            window.open(blobURL);
          } else {
            const filename = `${this.meeting.name}.${format}`;
            saveAs(blob, sanitizeForFs(filename));
          }

        }
      );
    }
  }
};
</script>