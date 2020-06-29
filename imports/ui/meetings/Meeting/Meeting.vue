<template>
  <div>
    <generic-dialog
      v-model="showDialog"
      :css-classes="['meeting']"
      max-width="1000px"
    >
      <template v-slot:title>
        <meeting-title
          v-if="meeting"
          :title="meeting.name"
          :color="meeting.color"
          :documents-count="documentsCount"
          :attendees-count="attendeesCount"
        />
      </template>
      <template v-slot:content>
        <div v-if="meeting" class="meeting__content">
          <div class="meeting__chips">
            <v-chip>
              <v-icon class="mr-2">
                mdi-clock
              </v-icon>
              {{ meetingInterval }}
            </v-chip>
            <v-chip
              v-if="meeting.type && meeting.type !== 'none'"
              color="accent"
            >
              {{ $t(`meetings.types.${meeting.type}`) }}
            </v-chip>
          </div>
          <v-expansion-panels
            v-model="panel"
            class="meeting__panels"
            tile
            accordion
            multiple
          >
            <!-- Meeting summary -->
            <v-expansion-panel>
              <v-expansion-panel-header class="meeting__panel-header">
                {{ $t('Informations' ) }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="meeting.description" v-html="markDown(meeting.description)" />
                <div v-if="meeting.agenda" v-html="markDown(meeting.agenda)" />
              </v-expansion-panel-content>
            </v-expansion-panel>
            <!-- Documents -->
            <v-expansion-panel v-if="meeting && meeting.documents">
              <v-expansion-panel-header class="meeting__panel-header">
                Documents {{ `(${documentsCount})` }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-chip-group
                  column
                  active-class="primary--text"
                >
                  <v-chip v-for="document in meeting.documents" :key="document.documentId">
                    {{ document.name }}
                  </v-chip>
                </v-chip-group>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <!-- Attendees -->
            <v-expansion-panel v-if="meeting && meeting.attendees">
              <v-expansion-panel-header class="meeting__panel-header">
                Participants {{ `(${attendeesCount})` }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <meeting-attendees
                  :key="meeting._id"
                  :project-id="meeting.projectId"
                  :attendees="meeting.attendees"
                  search-attendees-only
                  display="list"
                />
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </template>
      <template v-slot:actions>
        <template v-if="meeting">
          <!-- Edit meeting -->
          <v-btn
            v-if="canWriteMeeting === true"
            color="black"
            dark
            @click="editMeeting"
          >
            <v-icon left>
              mdi-pencil
            </v-icon>
            {{ $t(`meetings.edit`) }}
          </v-btn>
          <!-- Prepare / participate meeting -->
          <v-btn
            v-if="canWriteMeeting !== null"
            color="black"
            dark
            @click="openMeeting"
          >
            {{ $t(`meetings.${canWriteMeeting === true ? "prepare" : "participate"}`) }}
          </v-btn>
        </template>
      </template>
    </generic-dialog>
  </div>
</template>
<script>
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin";
import MeetingAttendees from "/imports/ui/meetings/Meeting/MeetingAttendees/MeetingAttendees";
import MeetingTitle from "/imports/ui/meetings/Meeting/MeetingTitle";
import Api from "/imports/ui/api/Api";

export default {
  components: {
    MeetingAttendees,
    MeetingTitle
  },
  mixins: [MarkdownMixin, DatesMixin],
  props: {
    meeting: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      panel: [0, 1],
      showDialog: false,
      canWriteMeeting: null
    };
  },
  computed: {
    title() {
      return this.meeting?.name;
    },
    documentsCount() {
      if (!this.meeting) return 0;
      return this.meeting.documents && this.meeting.documents.length
        ? this.meeting.documents.length : 0;
    },
    attendeesCount() {
      if (!this.meeting) return 0;
      return this.meeting.attendees && this.meeting.attendees.length
        ? this.meeting.attendees.length : 0;
    },
    meetingInterval() {
      if (!this.meeting) return "";
      return this.displayDateInterval({
        start: this.meeting.startDate,
        end: this.meeting.endDate,
        type: "dateWithHours"
      });
    }
  },
  watch: {
    meeting: {
      immediate: true,
      async handler() {
        if (!this.meeting) return;
        this.canWriteMeeting = await Api.call("permissions.canWriteMeeting", { meetingId: this.meeting._id });
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    editMeeting() {
      this.$emit("edit-meeting", this.meeting);
    },
    async openMeeting() {
      await this.$router.push({
        name: "meetings",
        params: {
          meetingId: this.meeting._id,
          projectId: this.meeting.projectId
        }
      });
    }
  }
};
</script>
<style lang="scss">
.meeting {
  .meeting__panels,
  .meeting__content {
    margin-top: 1rem;
  }
  .meeting__header {
    display: flex;
    flex-direction: column;
  }
  .meeting__title {
    margin-bottom: 4px;
  }
  .meeting__panel-header {
    padding: 0 1rem;
    font-size: 1.2rem;
  }
  .v-expansion-panel-content__wrap {
    padding: 1rem;
    padding-top: 0;
  }
}
</style>
