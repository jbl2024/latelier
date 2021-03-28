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
      <!-- Standard Toolbar -->
      <meetings-dashboard-toolbar
        v-if="$vuetify.breakpoint.mdAndUp"
        class="flex0"
        :display-type.sync="displayType"
        :display-types="displayTypes"
        @add-new-meeting="addNewMeeting"
        @set-today="setToday"
      />
      <!-- Mobile Toolbar -->
      <meeting-calendar-toolbar
        v-else-if="$vuetify.breakpoint.smAndDown"
        v-model="selectedDate"
        :start.sync="start"
        :end.sync="end"
        :display-type.sync="displayType"
        :display-types="displayTypes"
        :first-interval.sync="firstInterval"
        :flat="true"
        :mobile="true"
        @click-current-date="showBottomSheet = !showBottomSheet"
        @set-today="setToday"
        @next="next"
        @prev="prev"
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
            v-if="$vuetify.breakpoint.mdAndUp"
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
          <div v-else-if="displayType === 'list'">
            <v-row v-if="$vuetify.breakpoint.smAndDown">
              <v-col>
                <meeting-list-header
                  :meetings="selectedDateMeetings"
                  @add-new-meeting="addNewMeeting"
                />
              </v-col>
            </v-row>
            <meeting-list
              :meetings="selectedDateMeetings"
              empty-illustration="empty"
              date-interval="hours"
              with-edit
              @select="openMeeting"
              @edit-meeting="editMeeting"
            />
          </div>
        </v-col>
      </v-row>
    </template>
    <v-bottom-sheet v-model="showBottomSheet">
      <v-sheet class="meetings-dashboard__bottom-sheet">
        <meeting-calendar-date-picker
          v-model="selectedDate"
          :color="color"
          :picker-date.sync="pickerDate"
          :locale="currentLocale"
          :events="meetingsEvents"
        />
        <div class="meetings-dashboard__bottom-actions">
          <v-btn
            outlined
            @click="setToday"
          >
            {{ $t("calendar.today") }}
          </v-btn>
          <v-btn
            text
            @click="showBottomSheet = false"
          >
            {{ $t('Close') }}
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>
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
import MeetingList from "/imports/ui/meetings/MeetingList";
import MeetingListHeader from "/imports/ui/meetings/MeetingListHeader";
import moment from "moment";
import Api from "/imports/api/Api";

export default {
  components: {
    MeetingsDashboardToolbar,
    MeetingCalendar,
    MeetingCalendarToolbar,
    MeetingCalendarFilters,
    MeetingCalendarDatePicker,
    MeetingListHeader,
    MeetingEdit,
    MeetingList
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
    const date = this.date && moment(this.date).isValid()
      ? this.date : now;
    return {
      denseWidth: false,
      now,
      selectedDate: date,
      pickerDate: date,
      start: date,
      end: moment(date).add(4, "days").format("YYYY-MM-DD"),
      displayType: "5days",
      firstInterval: 7,
      showBottomSheet: false,
      showNewMeeting: false,
      showEditMeeting: false,
      selectedProjects: [],
      newMeeting: null,
      selectedMeeting: null,
      meetings: [],
      sheet: false,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
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
        },
        {
          text: this.$t("calendar.types.list"),
          value: "list",
          icon: "mdi-view-list"
        }
      ])
    };
  },
  computed: {
    selectedDateMeetings() {
      return this.meetings.filter((meeting) => this.selectedDate === moment(meeting.startDate).format("YYYY-MM-DD"));
    },
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
      const validDates = Boolean(this.selectedDate && this.start && this.end);
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
          start: this.formatDateTz(moment(this.start).format(startFormat)),
          end: this.formatDateTz(moment(this.end).format(endFormat))
        },
        {
          start: this.formatDateTz(moment(this.pickerDate).startOf("month").format(startFormat)),
          end: this.formatDateTz(moment(this.pickerDate).endOf("month").format(endFormat))
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
    },
    refreshParams() {
      return [
        this.currentProject,
        this.currentOrganization,
        this.dateRanges
      ].filter((param) => param);
    }
  },
  watch: {
    refreshParams: {
      immediate: true,
      async handler() {
        if (this.active) {
          await this.refresh();
        }
      }
    },
    selectedDate: {
      immediate: true,
      handler(date, prev) {
        const route = {
          name: this.$route.name,
          params: { ...this.$route.params, date }
        };
        this.$router.replace(route).catch(() => {});
        this.$store.dispatch("storeRoute", {
          name: "meetings-dashboard",
          route
        });
        if (prev && date) {
          // prev is undefined when
          // bottomsheet is shown the first time

          // we close only when selecting
          // a new date on opened bottom sheet
          this.showBottomSheet = false;
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
    },
    "$vuetify.breakpoint.smAndDown": {
      immediate: true,
      handler(smAndDown) {
        this.displayType = smAndDown === true ? "list" : "5days";
        this.setSameDate(this.selectedDate);
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
    setSameDate(date) {
      this.selectedDate = date;
      this.pickerDate = date;
      this.start = date;
      this.end = date;
    },
    editMeeting(meeting) {
      this.selectedMeeting = meeting;
      this.showEditMeeting = true;
    },
    async moveMeeting(meetingEvent, direction) {
      const meeting = this.meetings.find((m) => m._id === meetingEvent.id);
      if (!meeting || !["up", "down"].includes(direction)) return;
      const func = direction === "up" ? "subtract" : "add";
      meeting.startDate = this.formatDateTz(moment(meeting.startDate)[func](30, "minutes"));
      meeting.endDate = this.formatDateTz(moment(meeting.endDate)[func](30, "minutes"));
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
      } else if (this.displayType === "list") {
        const day = moment(this.start).add(1, "days").format("YYYY-MM-DD");
        this.setSameDate(day);
      }
    },
    prev() {
      if (this.isCalendarDisplay) {
        this.$refs.calendar.prev();
      } else if (this.displayType === "list") {
        const day = moment(this.start).add(-1, "days").format("YYYY-MM-DD");
        this.setSameDate(day);
      }
    },
    async onCreateMeeting(meetingId) {
      const createdMeeting = await Api.call("meetings.get", {
        meetingId
      }).catch((error) => {
        this.$notifyError(error);
      });
      await this.openMeeting(createdMeeting);
    },
    addNewMeeting(start, end) {
      const newMeeting = MeetingUtils.makeNewMeeting();
      if (this.color) {
        newMeeting.color = this.color;
      }
      if (start && end) {
        newMeeting.startDate = start;
        newMeeting.endDate = end;
      }
      this.newMeeting = newMeeting;
      this.showNewMeeting = true;
    },
    async selectEvent(event) {
      await this.openMeeting({
        _id: event.id,
        projectId: event?.project?._id
      });
    },
    async openMeeting(meeting) {
      await this.$router.push({
        name: "meetings",
        params: {
          meetingId: meeting._id,
          projectId: meeting.projectId
        }
      }).catch((error) => this.$notifyError(error));
    },
    refresh() {
      const params = {
        page: 1,
        dates: this.dateRanges
      };
      if (this.currentProject) {
        params.projectId = this.currentProject._id;
      }
      Api.call("meetings.findMeetings", params).then((result) => {
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = result.totalPages;
        this.meetings = Array.isArray(result?.data) ? result.data : [];
      }).catch((error) => {
        this.$notifyError(error);
      });
    },
    onRemove() {
      this.showEditMeeting = false;
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

@import "/imports/ui/styles/mixins/breakpoint";

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
    @include media-query("sm-and-down") {
      padding-top: 1rem;
      padding-bottom: 0;
    }
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

.meetings-dashboard__bottom-sheet {
  padding: 1rem;
  border-radius: 1rem 1rem 0 0;
  .meetings-dashboard__bottom-actions {
    margin-top: 1rem;
    display: flex;
    width: 100;
    justify-content: space-between;
  }
}

</style>
