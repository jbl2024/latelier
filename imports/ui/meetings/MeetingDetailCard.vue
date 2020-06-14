<template>
  <v-card v-if="meeting" class="flex-container">
    <v-toolbar class="flex0" dense>
      <rich-editor-menu-bar :editor="currentEditor" />
    </v-toolbar>
    <v-card-text class="flex1">
      <div class="list">
        <h1>{{ meeting.name }}</h1>
        <div v-if="meeting.description" v-html="meeting.description" />
        <template>
          <h2>{{ $t("meetings.sections.agenda") }}</h2>
          <rich-editor
            ref="editor1"
            v-model="meeting.agenda"
            class="editor"
            hide-toolbar
            autofocus
            @on-focus="setCurrentEditor"
          />
        </template>
        <template>
          <h2>{{ $t("meetings.sections.report") }}</h2>
          <rich-editor
            v-model="meeting.report"
            class="editor"
            hide-toolbar
            @on-focus="setCurrentEditor"
          />
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  props: {
    meeting: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentEditor: null
    };
  },
  watch: {
    "meeting.agenda"(agenda) {
      this.updateAgenda(agenda);
    },
    "meeting.report"(report) {
      this.updateReport(report);
    }
  },
  methods: {
    updateAgenda: debounce(function () {
      Meteor.call(
        "meetings.updateAgenda",
        {
          meetingId: this.meeting._id,
          agenda: this.meeting.agenda
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
        }
      );
    }, 1000),

    updateReport: debounce(function () {
      Meteor.call(
        "meetings.updateReport",
        {
          meetingId: this.meeting._id,
          report: this.meeting.report
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
          }
        }
      );
    }, 1000),

    setCurrentEditor(editor) {
      this.currentEditor = editor.editor;
    }
  }
};
</script>

<style scoped>
.editor {
  color: black;
  font-size: 16px;
  line-height: 1.5;
}

.flex-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: white;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

.list {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
