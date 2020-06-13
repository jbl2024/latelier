<template>
  <v-card v-if="meeting" class="flex-container">
    <v-list-item class="flex0">
      <v-list-item-avatar color="grey">
        <v-icon>mdi-play</v-icon>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="headline">
          {{ meeting.name }}
        </v-list-item-title>
        <v-list-item-subtitle />
      </v-list-item-content>
    </v-list-item>
    <v-card-text class="flex1 list">
      <div v-if="meeting.description" v-html="meeting.description" />
      <template>
        <h2>{{ $t("meetings.sections.agenda") }}</h2>
        <rich-editor
          v-model="meeting.agenda"
          class="editor"
          hide-toolbar
        />
      </template>
      <template>
        <h2>{{ $t("meetings.sections.report") }}</h2>
        <rich-editor
          v-model="meeting.report"
          class="editor"
          hide-toolbar
        />
      </template>
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
    }, 1000)
  }
};
</script>

<style scoped>
.editor {
  color: black;
  font-size: 18px;
}

.flex-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  height: 100%;
  width:100%;
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
  margin-top: 24px;
}

</style>
