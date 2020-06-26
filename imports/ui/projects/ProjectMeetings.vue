<template>
  <div
    ref="projectMeetings"
    v-resize="onResize"
    class="project-meetings"
    :style="getBackgroundUrl(currentUser)"
  >
    <v-progress-linear v-if="!currentProject" indeterminate />
    <div v-else>
      <!-- New meeting -->
      <meeting-edit
        ref="newMeeting"
        :is-shown.sync="showNewMeeting"
        :project-id="projectId"
        :meeting="newMeeting"
        :types="meetingTypes"
        @created="fetch"
      />
      <!-- Edit existing meeting -->
      <meeting-edit
        ref="editMeeting"
        :key="selectedMeetingId"
        :is-shown.sync="showEditMeeting"
        :project-id="projectId"
        :meeting="selectedMeeting"
        :types="meetingTypes"
        @created="fetch"
        @updated="fetch"
        @removed="fetch"
      />
      <meeting
        ref="meeting"
        :meeting="selectedMeeting"
        @edit-meeting="editMeeting"
      />
      <project-meetings-toolbar
        :display-type.sync="displayType"
        :display-types="displayTypes"
        @add-new-meeting="addNewMeeting"
      />
      <v-row>
        <!-- Side calendar -->
        <v-col
          v-show="$vuetify.breakpoint.mdAndUp"
          cols="12"
          sm="12"
          md="12"
          :lg="cols.aside.lg"
          :class="['aside', denseWidth ? 'lg-dense-width' : null]"
        >
          <v-row :no-gutters="!denseWidth">
            <v-col :lg="asideCols.datepicker.lg">
              <meeting-calendar-date-picker
                v-model="selectedDate"
                :picker-date.sync="pickerDate"
                :locale="currentLocale"
                :events="meetingsEvents"
              />
            </v-col>
            <v-col :lg="asideCols.filters.lg">
              <meeting-calendar-filters
                class="filters"
                :types="meetingTypes"
                :selected-types.sync="selectedMeetingTypes"
              />
            </v-col>
          </v-row>
        </v-col>
        <!-- Main content -->
        <v-col
          cols="12"
          sm="12"
          :lg="cols.body.lg"
          class="body"
        >
          <meeting-calendar-toolbar
            v-model="selectedDate"
            :start.sync="start"
            :end.sync="end"
            :display-type.sync="displayType"
            :display-types="displayTypes"
            :first-interval.sync="firstInterval"
            :flat="true"
            @set-today="setToday"
            @next="next"
            @prev="prev"
          />
          <!-- Calendar display type -->
          <meeting-calendar
            v-if="isCalendarDisplay"
            ref="calendar"
            v-model="selectedDate"
            :start.sync="start"
            :end.sync="end"
            :events="meetingsEvents"
            :display-type.sync="displayType"
            :display-types="displayTypes"
            :locale="currentLocale"
            :first-interval="firstInterval"
            @select-event="selectEvent"
            @add-new-meeting="addNewMeeting"
          />
          <!-- Streamline list of meetings -->
          <meeting-list v-else
                        :meetings="meetings"
          />
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
import MeetingUtils from "/imports/api/meetings/utils";
import ProjectMeetingsToolbar from "/imports/ui/projects/ProjectMeetingsToolbar";
import MeetingCalendar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendar";
import MeetingCalendarFilters from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarFilters";
import MeetingCalendarToolbar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarToolbar";
import MeetingCalendarDatePicker from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarDatePicker";
import MeetingEdit from "/imports/ui/meetings/Meeting/MeetingEdit";
import Meeting from "/imports/ui/meetings/Meeting/Meeting";
import moment from "moment";

export default {
  components: {
    ProjectMeetingsToolbar,
    MeetingCalendar,
    MeetingCalendarFilters,
    MeetingCalendarToolbar,
    MeetingCalendarDatePicker,
    Meeting,
    MeetingEdit
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
      denseWidth: false,
      now: now,
      selectedDate: now,
      pickerDate: moment(now).format("YYYY-MM"),
      start: now,
      end: null,
      displayType: "5days",
      firstInterval: 7,
      showNewMeeting: false,
      showEditMeeting: false,
      newMeeting: null,
      displayTypes: Object.freeze([
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
    active() {
      return Boolean(
        this.pickerDate
        && this.start
        && this.end
        && this.currentProject === Object(this.currentProject)
      );
    },
    selectedMeetingId() {
      if (!this.selectedMeeting?._id) return null;
      return this.selectedMeeting._id;
    },
    dateRanges() {
      const startFormat = "YYYY-MM-DD 00:00:00";
      const endFormat = "YYYY-MM-DD 23:59:59";
      return [
        {
          start: moment(this.start).format(startFormat),
          end: moment(this.end).format(endFormat)
        },
        {
          start: moment(this.pickerDate).startOf("month").format(startFormat),
          end: moment(this.pickerDate).endOf("month").format(endFormat)
        }
      ];
    },
    isCalendarDisplay() {
      const foundDisplayType = this.displayTypes.find(
        (displayType) => displayType.value === this.displayType
      );
      return foundDisplayType && foundDisplayType.type === "calendar";
    },
    ...mapState(["currentLocale", "currentUser"]),
    ...mapState("project", ["currentProject"]),
    ...mapState("meeting", ["selectedMeeting", "meetingTypes"]),
    ...mapGetters("meeting", ["filteredMeetingsByProjectId"]),
    selectedMeetingTypes: {
      get() {
        return this.$store.state.meeting.selectedMeetingTypes;
      },
      set(selectedMeetingTypes) {
        this.$store.dispatch("meeting/setSelectedMeetingTypes", selectedMeetingTypes);
      }
    },
    meetings() {
      return this.filteredMeetingsByProjectId(this.currentProject._id);
    },
    meetingsEvents() {
      return MeetingUtils.formatMeetingsAsEvents(this.meetings);
    },
    asideCols() {
      if (this.denseWidth) {
        return {
          datepicker: { lg: 6 },
          filters: { lg: 6 }
        };
      }
      return {
        datepicker: { lg: 12 },
        filters: { lg: 12 }
      };
    },
    cols() {
      if (this.denseWidth) {
        return {
          aside: { lg: 12 },
          body: { lg: 12 }
        };
      }
      return {
        aside: { lg: 3 },
        body: { lg: 9 }
      };
    }
  },
  watch: {
    dateRanges: {
      immediate: true,
      async handler() {
        if (this.active) {
          await this.fetch();
        }
      }
    }
  },
  async mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    await this.$store.dispatch("meeting/fetchMeetingTypes");
    await this.$store.dispatch("meeting/fetchMeetingRoles");
    await this.$store.dispatch("meeting/setSelectedMeetingTypes", Object.values(this.meetingTypes));
  },
  beforeDestroy() {
    this.$store.dispatch("meeting/setSelectedMeeting", null);
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
    ...mapActions("meeting", ["fetchMeetings", "fetchSelectedMeeting"]),
    setToday() {
      this.selectedDate = this.now;
    },
    next() {
      if (this.isCalendarDisplay) {
        this.$refs.calendar.next();
      }
    },
    prev() {
      if (this.isCalendarDisplay) {
        this.$refs.calendar.prev();
      }
    },
    addNewMeeting(selectedTime) {
      const newMeeting = MeetingUtils.makeNewMeeting();
      if (selectedTime?.date && selectedTime?.hour) {
        const startHour = `${String(selectedTime.hour).padStart(2, "0")}:00`;
        const endHour = `${String(selectedTime.hour + 1).padStart(2, "0")}:00`;
        newMeeting.startDate = `${selectedTime.date} ${startHour}`;
        newMeeting.endDate = `${selectedTime.date} ${endHour}`;
      }
      this.newMeeting = newMeeting;
      this.showNewMeeting = true;
    },
    async editMeeting(meeting) {
      try {
        await this.fetchSelectedMeeting({
          meetingId: meeting._id
        });
        this.showEditMeeting = true;
      } catch (error) {
        this.showEditMeeting = false;
        this.$notifyError(error);
      }
    },
    async fetch() {
      try {
        await this.fetchMeetings({
          projectId: this.currentProject._id,
          page: 1,
          dates: this.dateRanges
        });
      } catch (error) {
        this.$notifyError(error);
      }
    },
    async selectEvent(event) {
      try {
        this.$refs.meeting.close();
        await this.fetchSelectedMeeting({
          meetingId: event.id
        });
        this.$refs.meeting.open();
      } catch (error) {
        this.$refs.meeting.close();
        this.$notifyError(error);
      }
    },
    onResize() {
      const width = this.$refs.projectMeetings.offsetWidth;
      this.denseWidth = width < 1200;
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
    &:not(.lg-dense-width) {
      padding-right: 0;
      .filters {
        margin-top: 2rem;
      }
    }
  }


  .project-meetings__picker {
    .v-picker__title {
      display: none;
    }
  }
}
</style>
