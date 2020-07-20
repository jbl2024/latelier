<template>
  <div
    ref="meetingsDashboard"
    v-resize="onResize"
    class="meetings-dashboard"
    :style="getBackgroundUrl(currentUser)"
  >
    <v-progress-linear v-if="!isReady" indeterminate />
    <template v-else>
      <!-- New meeting -->
      <meeting-edit
        ref="newMeeting"
        :is-shown.sync="showNewMeeting"
        :project="currentProject"
        :organization-id="organizationId"
        :meeting="newMeeting"
        :projects="projects"
        @created="onCreateMeeting"
      />
      <!-- Edit existing meeting -->
      <meeting-edit
        ref="editMeeting"
        :key="selectedMeetingId"
        :is-shown.sync="showEditMeeting"
        :project="currentProject"
        :organization-id="organizationId"
        :meeting="selectedMeeting"
        :projects="projects"
        @created="refresh"
        @updated="refresh"
        @removed="onRemove"
      />
      <meeting
        :is-shown.sync="showMeeting"
        :meeting="selectedMeeting"
        @edit-meeting="editMeeting"
      />
      <meetings-dashboard-toolbar
        class="flex0"
        :display-type.sync="displayType"
        :display-types="displayTypes"
        @add-new-meeting="addNewMeeting"
      />
      <v-row class="flex1">
        <!-- Side calendar -->
        <v-col
          v-show="$vuetify.breakpoint.mdAndUp"
          cols="3"
          sm="12"
          md="6"
          :lg="cols.aside.lg"
          :class="['aside', denseWidth ? 'lg-dense-width' : null]"
        >
          <v-row :no-gutters="!denseWidth">
            <v-col :lg="asideCols.datepicker.lg">
              <meeting-calendar-date-picker
                v-model="selectedDate"
                :color="color"
                :picker-date.sync="pickerDate"
                :locale="currentLocale"
                :events="meetingsEvents"
              />
            </v-col>
            <v-col v-if="organizationId" :lg="asideCols.datepicker.lg">
              <meeting-calendar-filters
                class="filters"
                :projects="projects"
                :selected-projects.sync="selectedProjects"
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
            @event-move-up="moveMeeting($event, 'up')"
            @event-move-down="moveMeeting($event, 'down')"
            @add-new-meeting="addNewMeeting"
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState } from "vuex";
import MeetingUtils from "/imports/api/meetings/utils";
import MeetingsDashboardToolbar from "/imports/ui/meetings/MeetingsDashboardToolbar";
import MeetingCalendar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendar";
import MeetingCalendarToolbar from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarToolbar";
import MeetingCalendarFilters from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarFilters";
import MeetingCalendarDatePicker from "/imports/ui/meetings/MeetingCalendar/MeetingCalendarDatePicker";
import MeetingEdit from "/imports/ui/meetings/Meeting/MeetingEdit";
import Meeting from "/imports/ui/meetings/Meeting/Meeting";
import moment from "moment";
import Api from "/imports/api/Api";

export default {
  components: {
    MeetingsDashboardToolbar,
    MeetingCalendar,
    MeetingCalendarToolbar,
    MeetingCalendarFilters,
    MeetingCalendarDatePicker,
    Meeting,
    MeetingEdit
  },
  mixins: [DatesMixin, BackgroundMixin],
  props: {
    projectId: {
      type: String,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    date: {
      type: String,
      default() {
        return moment().format("YYYY-MM-DD");
      }
    }
  },
  data() {
    const now = this.nowDate();
    return {
      denseWidth: false,
      now: now,
      selectedDate: this.date,
      pickerDate: this.date,
      start: now,
      end: null,
      displayType: "5days",
      firstInterval: 7,
      showNewMeeting: false,
      showEditMeeting: false,
      selectedProjects: [],
      showMeeting: false,
      newMeeting: null,
      selectedMeeting: null,
      meetings: [],
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
    color() {
      if (this.projectId) {
        return this.currentProject?.color ? this.currentProject.color : null;
      }
      return null;
    },
    isReady() {
      if (this.projectId) return this.currentProject;
      if (this.organizationId) return this.organizationId;
      return false;
    },
    active() {
      const validDates = Boolean(this.pickerDate && this.start && this.end);
      const validProject = this.currentProject === Object(this.currentProject);
      const validOrganization = this.currentOrganization === Object(this.currentOrganization);
      if (this.projectId) return validDates && validProject;
      if (this.organizationId) return validDates && validOrganization;
      return false;
    },
    selectedMeetingId() {
      if (!this.selectedMeeting?._id) return null;
      return this.selectedMeeting._id;
    },
    meetingsEvents() {
      const events = this.formatMeetingsAsEvents(this.meetings);
      return this.filterMeetingsEvents(events);
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
    ...mapState("organization", ["currentOrganization"]),
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
          await this.refresh();
        }
      }
    },
    selectedDate: {
      immediate: true,
      handler(date) {
        const route = {
          name: this.$route.name,
          params: { ...this.$route.params, date }
        };
        this.$router.replace(route);
        this.$store.dispatch("storeRoute", {
          name: "meetings-dashboard",
          route
        });
      }
    },
    currentOrganization: {
      async handler() {
        if (this.active) {
          await this.refresh();
        }
      }
    },
    currentProject: {
      async handler() {
        if (this.active) {
          await this.refresh();
        }
      }
    },
    projectId: {
      immediate: true,
      handler(projectId) {
        if (projectId) {
          this.$subscribe("project", projectId);
        }
      }
    },
    organizationId: {
      immediate: true,
      handler(organizationId) {
        if (organizationId) {
          this.$subscribe("organization", organizationId);
          this.$subscribe("projects", organizationId);
        }
      }
    }
  },
  async mounted() {
    if (this.projectId) {
      this.$store.dispatch("project/setCurrentProjectId", this.projectId);
      this.$store.dispatch("organization/setCurrentOrganizationId", null);
    } else if (this.organizationId) {
      this.$store.dispatch("organization/setCurrentOrganizationId", this.organizationId);
      this.$store.dispatch("project/setCurrentProject", null);
    }
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
    this.$store.dispatch("organization/setCurrentOrganizationId", null);
  },
  meteor: {
    project() {
      if (this.organizationId) return null;
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
      return project;
    },
    projects: {
      params() {
        return {
          organizationId: this.organizationId
        };
      },
      update({ organizationId }) {
        if (this.projectId) return [];
        const projects = Projects.find({ organizationId }).fetch();
        if (projects) {
          this.selectedProjects = projects.map((p) => p._id);
        }
        return projects;
      }
    },
    organization: {
      params() {
        return {
          organizationId: this.organizationId
        };
      },
      update() {
        if (this.projectId) return null;
        const organization = Organizations.findOne();
        this.$store.dispatch("organization/setCurrentOrganization", organization);
        return organization;
      }
    }
  },
  methods: {
    async moveMeeting(meetingEvent, direction) {
      const meeting = this.meetings.find((m) => m._id === meetingEvent.id);
      if (!meeting || !["up", "down"].includes(direction)) return;
      const dateFormat = "YYYY-MM-DD HH:mm";
      const func = direction === "up" ? "subtract" : "add";
      meeting.startDate = moment(meeting.startDate)[func](30, "minutes").format(dateFormat);
      meeting.endDate = moment(meeting.endDate)[func](30, "minutes").format(dateFormat);
      const params = MeetingUtils.sanitizeMeetingForUpdate(meeting);
      await Api.call("meetings.update", params);
      await this.refresh();
    },
    filterMeetingsEvents(events) {
      if (this.organizationId && this.selectedProjects.length) {
        return events.filter((event) => this.selectedProjects.includes(event?.project?._id));
      }
      return events;
    },
    formatMeetingsAsEvents(meetings) {
      const withProjects = this.organizationId
      && Array.isArray(this.projects)
      && this.projects.length > 0;
      return MeetingUtils.formatMeetingsAsEvents(meetings).map((event) => {
        if (withProjects) {
          const foundProject = this.projects.find((project) => project._id === event?.project?._id);
          if (foundProject) {
            event.project = foundProject;
          }
        }
        return event;
      });
    },
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
    async onCreateMeeting(meetingId) {
      const createdMeeting = await Api.call("meetings.get", {
        meetingId
      }).catch((error) => {
        this.$notifyError(error);
      });
      await this.$router.push({
        name: "meetings",
        params: {
          meetingId: createdMeeting._id,
          projectId: createdMeeting.projectId
        }
      }).catch((error) => this.$notifyError(error));
    },
    addNewMeeting(selectedTime) {
      const newMeeting = MeetingUtils.makeNewMeeting();
      if (this.color) {
        newMeeting.color = this.color;
      }
      if (selectedTime?.date && selectedTime?.hour) {
        const startHour = `${String(selectedTime.hour).padStart(2, "0")}:00`;
        const endHour = `${String(selectedTime.hour + 1).padStart(2, "0")}:00`;
        newMeeting.startDate = `${selectedTime.date} ${startHour}`;
        newMeeting.endDate = `${selectedTime.date} ${endHour}`;
      }
      this.newMeeting = newMeeting;
      this.showNewMeeting = true;
    },
    editMeeting(meeting) {
      Api.call("meetings.get", {
        meetingId: meeting._id
      }).then((meet) => {
        this.selectedMeeting = meet;
        this.showEditMeeting = true;
      }).catch((error) => {
        this.showEditMeeting = false;
        this.$notifyError(error);
      });
    },
    async selectEvent(event) {
      await this.$router.push({
        name: "meetings",
        params: {
          meetingId: event.id,
          projectId: event?.project?._id
        }
      });
    },
    refresh() {
      const params = {
        page: 1,
        dates: this.dateRanges
      };
      if (this.currentProject) {
        params.projectId = this.currentProject._id;
      }
      if (this.currentOrganization) {
        params.organizationId = this.currentOrganization._id;
      }
      Api.call("meetings.findMeetings", params).then((result) => {
        this.meetings = Array.isArray(result?.data) ? result.data : [];
      }).catch((error) => {
        this.$notifyError = error;
      });
    },
    onRemove() {
      this.showEditMeeting = false;
      this.showMeeting = false;
      this.refresh();
    },
    onResize() {
      const width = window.innerWidth;
      this.denseWidth = width < 1200;
    }
  }
};
</script>

<style lang="scss" scoped>
.meetings-dashboard {
  display: flex;
  min-height: 0;
  height: 100%;
  width: 100%;
  flex-direction: column;
  position: absolute;
  flex: 1;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;

  .filters {
    margin-top: 1rem;
  }
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
}

.flex0 {
  flex: 0;
  height: 100%;
  z-index: 1;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

</style>
