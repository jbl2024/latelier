<template>
  <div class="project-meetings" :style="getBackgroundUrl(currentUser)">
    <v-progress-linear v-if="!currentProject" indeterminate />
    <div v-else>
      <new-meeting
        ref="newMeeting"
        :project-id="projectId"
        :selected-date="newMeetingDate"
        :selected-start-hour="newMeetingStartHour"
        :selected-end-hour="newMeetingEndHour"
        @created="fetch"
      />
      <meeting
        ref="meeting"
        :meeting="currentMeeting"
      />
      <project-meetings-toolbar
        :display-type.sync="displayType"
        :display-types="displayTypes"
        @add-meeting="addMeeting"
      />
      <v-row>
        <!-- Side calendar -->
        <v-col
          v-show="$vuetify.breakpoint.mdAndUp"
          cols="12"
          sm="12"
          lg="3"
          class="aside"
        >
          <div>
            <v-btn class="today-button" @click="setToday">
              {{ $t("calendar.today") }}
            </v-btn>
          </div>
          <meeting-calendar-date-picker
            v-model="selectedDate"
            :locale="currentLocale"
            :events="meetingsEvents"
          />
        </v-col>
        <!-- Main content -->
        <v-col cols="12" sm="12" lg="9" class="body">
          <meeting-calendar-toolbar
            v-model="selectedDate"
            :start.sync="start"
            :end.sync="end"
            :display-type.sync="displayType"
            :display-types="displayTypes"
            :is-calendar-active="isCalendarActive"
            :first-interval.sync="firstInterval"
            :flat="true"
            @next="next"
            @prev="prev"
          />
          <!-- Calendar display type -->
          <meeting-calendar
            v-model="selectedDate"
            v-if="isCalendarActive"
            ref="calendar"
            :start.sync="start"
            :end.sync="end"
            :events="meetingsEvents"
            :display-type.sync="displayType"
            :display-types="displayTypes"
            :locale="currentLocale"
            :first-interval="firstInterval"
            @select-event="selectEvent"
            @add-meeting="addMeeting"
          />
          <!-- Streamline list of meetings -->
          <meeting-list v-else />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState, mapGetters, mapActions } from "vuex";
import ProjectMeetingsToolbar from "/imports/ui/projects/ProjectMeetingsToolbar";
import MeetingCalendar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendar";
import MeetingCalendarToolbar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarToolbar";
import MeetingCalendarDatePicker from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarDatePicker";
import MeetingList from "/imports/ui/meetings/MeetingList";
import NewMeeting from "/imports/ui/meetings/Meeting/NewMeeting";
import Meeting from "/imports/ui/meetings/Meeting/Meeting";
import moment from "moment";

export default {
  components: {
    ProjectMeetingsToolbar,
    MeetingCalendar,
    MeetingCalendarToolbar,
    MeetingCalendarDatePicker,
    MeetingList,
    Meeting,
    NewMeeting
  },
  mixins: [DatesMixin, BackgroundMixin],
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    const now = this.nowDate();
    return {
      now: now,
      selectedDate: now,
      start: now,
      end: null,
      displayType: "5days",
      firstInterval: 7,
      newMeetingDate: moment().format("YYYY-MM-DD HH:00"),
      newMeetingStartHour: null,
      newMeetingEndHour: null,
      displayTypes: Object.freeze([
        {
          text: this.$t("meetings.list"),
          value: "list",
          icon: "mdi-view-sequential"
        },
        {
          text: this.$t("calendar.types.day"),
          value: "day",
          icon: "mdi-calendar-today",
          type: "calendar"
        },
        {
          text: this.$t("calendar.types.5days"),
          value: "5days",
          icon: "mdi-calendar-week",
          type: "calendar"
        },
        {
          text: this.$t("calendar.types.week"),
          value: "week",
          icon: "mdi-calendar-weekend",
          type: "calendar"
        },
        {
          text: this.$t("calendar.types.month"),
          value: "month",
          icon: "mdi-calendar-month",
          type: "calendar"
        }
      ])
    };
  },
  computed: {
    isCalendarActive() {
      const foundDisplayType = this.displayTypes.find(
        (displayType) => displayType.value === this.displayType
      );
      return foundDisplayType && foundDisplayType.type === "calendar";
    },
    ...mapState(["currentLocale", "currentUser"]),
    ...mapState("project", ["currentProject"]),
    ...mapState("meeting", ["currentMeeting"]),
    ...mapGetters("meeting", ["meetingsEventsByProjectId"]),
    meetingsEvents() {
      return this.meetingsEventsByProjectId(this.currentProject._id);
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("meeting/setCurrentMeeting", null);
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    project() {
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    }
  },
  methods: {
    ...mapActions("meeting", ["fetchMeetings", "fetchCurrentMeeting"]),
    setToday() {
      this.selectedDate = this.now;
    },
    next() {
      if (this.isCalendarActive) {
        this.$refs.calendar.next();
      }
    },
    prev() {
      if (this.isCalendarActive) {
        this.$refs.calendar.prev();
      }
    },
    resetNewMeeting() {
      this.newMeetingDate = moment().format("YYYY-MM-DD HH:00");
      this.newMeetingStartHour = null;
      this.newMeetingEndHour = null;
    },
    addMeeting(selectedTime) {
      if (selectedTime?.date && selectedTime?.hour) {
        this.newMeetingDate = selectedTime.date;
        this.newMeetingStartHour = `${new String(selectedTime.hour).padStart(2, "0")}:00`;
        this.newMeetingEndHour = `${new String(selectedTime.hour + 1).padStart(2, "0")}:00`;
      } else {
        this.resetNewMeeting();
      }
      this.$refs.newMeeting.open();
    },
    async fetch() {
      try {
        await this.fetchMeetings({
          projectId: this.currentProject._id,
          page: 1
        });
      } catch (error) {
        this.$notifyError(error);
      }
    },
    async selectEvent(event) {
      try {
        this.$refs.meeting.close();
        await this.fetchCurrentMeeting({
          meetingId: event.id
        });
        this.$refs.meeting.open();
      } catch (error) {
        this.$refs.meeting.close();
        this.$notifyError(error);
      }
    }
  },
  watch: {
    async currentProject() {
      await this.fetch();
    }
  }
};
</script>

<style lang="scss">
.project-meetings {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;

  .current-date {
    border-radius: 16px;
    background-color: white;
    margin-bottom: 1rem;
  }

  .body,
  .aside {
    padding: 2rem;
    padding-bottom: 1rem;
  }

  .aside {
    padding-right: 0;
    .today-button {
      background-color: white;
      margin-bottom: 1rem;
    }
  }


  .project-meetings__picker {
    .v-picker__title {
      display: none;
    }
  }
}
</style>
