<template>
  <div class="project-meetings" :style="getBackgroundUrl(currentUser)">
    <v-progress-linear v-if="!currentProject" indeterminate />
    <div v-else>
      <project-meetings-toolbar
        :display-type.sync="displayType"
        :display-types="displayTypes"
      />
      <v-row>
        <!-- Side calendar with filters -->
        <v-col 
          v-show="$vuetify.breakpoint.mdAndUp"
          cols="12"
          sm="12"
          lg="3"
          class="aside"
        >
          <meeting-calendar-date-picker
            v-model="start"
            :locale="currentLocale"
          />
        </v-col>
        <!-- Main content -->
        <v-col 
          cols="12"
          sm="12"
          lg="9"
          class="body"
        >
          <meeting-calendar-toolbar
            :start.sync="start"
            :end.sync="end"
            :display-type.sync="displayType"
            :display-types="displayTypes"
            :is-calendar-active="isCalendarActive"
            :flat="true"
            @set-today="setToday"
            @next="next"
            @prev="prev"
          />
          <!-- Calendar display type -->
          <meeting-calendar
            ref="calendar"
            v-if="isCalendarActive"
            :start.sync="start"
            :end.sync="end"
            :display-type.sync="displayType"
            :display-types="displayTypes"
            :locale="currentLocale"
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
import { mapState } from "vuex";
import ProjectMeetingsToolbar from "/imports/ui/projects/ProjectMeetingsToolbar";
import MeetingCalendar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendar";
import MeetingCalendarToolbar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarToolbar";
import MeetingCalendarDatePicker from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarDatePicker";
import MeetingList from "/imports/ui/meetings/MeetingList";

export default {
  components: {
    ProjectMeetingsToolbar,
    MeetingCalendar,
    MeetingCalendarToolbar,
    MeetingCalendarDatePicker,
    MeetingList
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
      start: now,
      end: null,
      displayType: "5days",
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
      const foundDisplayType = this.displayTypes.find((displayType) => displayType.value === this.displayType);
      return foundDisplayType && foundDisplayType.type === "calendar";
    },
    ...mapState(["currentLocale", "currentUser"]),
    ...mapState("project", ["currentProject"])
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
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
    setToday() {
      this.start = this.now;
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
  }

  .project-meetings__picker {
    .v-picker__title {
      display: none;
    }
  }
}
</style>
