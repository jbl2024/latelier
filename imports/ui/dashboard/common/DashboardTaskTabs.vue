<template>
  <div class="tasks">
    <div class="categories">
      <v-row no-gutters>
        <v-col v-for="category in categories" :key="category.id"
               sm="12"
               md="4"
               @click="currentCategory = category.id"
        >
          <div :class="cssCategoryClasses(category.id)">
            <v-icon
              v-if="category.icon"
              class="mr-1"
              small
            >
              {{ category.icon }}
            </v-icon>
            <span>
              {{ category.text }}
            </span>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-divider />
    <!-- Tasks -->
    <v-tabs
      v-if="currentCategory === 'task'"
      v-model="taskTab"
      v-scroll:[scrollTarget]="onScroll"
      :class="tabsShouldStick ? 'sticky-tabs' : null"
    >
      <v-tabs-slider color="accent" />
      <v-tab>{{ $t("Recents") }}</v-tab>
      <v-tab>{{ $t("My tasks") }}</v-tab>
      <v-tab>{{ $t("Late") }}</v-tab>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :key="key('recent')"
          type="recent"
          :organization-id="organizationId"
          :project-id="projectId"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :key="key('assignedToMe')"
          type="assignedToMe"
          :organization-id="organizationId"
          :project-id="projectId"
        />
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <dashboard-task-list
          :key="key('late')"
          type="late"
          empty-illustration="celebration"
          :organization-id="organizationId"
        />
      </v-tab-item>
    </v-tabs>
    <!-- Meetings -->
    <div v-if="currentCategory === 'meeting'">
      <meeting-find-list
        :project-id="projectId"
        :organization-id="organizationId"
        @select="onSelectMeeting"
      />
    </div>
    <!-- Project History -->
    <div v-show="currentCategory === 'history'">
      <project-history v-if="projectId" :key="projectId" :project-id="projectId" />
    </div>
  </div>
</template>
<script>
import DashboardTaskList from "/imports/ui/dashboard/common/DashboardTaskList";
import MeetingFindList from "/imports/ui/meetings/MeetingFindList";

export default {
  components: {
    DashboardTaskList,
    MeetingFindList
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      currentCategory: "task",
      scrollTarget: "#left-drawer > .v-navigation-drawer__content",
      tabsShouldStick: false,
      taskTab: null
    };
  },
  computed: {
    categories() {
      return Object.freeze([
        { id: "task", text: this.$t("Tasks"), icon: "mdi-format-list-bulleted" },
        { id: "meeting", text: this.$t("meetings.meetings"), icon: "mdi-calendar-star" },
        this.projectId ? { id: "history", text: this.$t("History"), icon: "mdi-history" } : null
      ].filter((cat) => cat !== null));
    },
    key() {
      return function(type) {
        return [this.projectId, this.organizationId, type].filter((part) => part).join("-");
      };
    }
  },
  methods: {
    onSelectMeeting(meeting) {
      if (!meeting) return;
      this.$router.push({
        name: "meetings",
        params: {
          projectId: meeting.projectId,
          meetingId: meeting._id
        }
      });
    },
    cssCategoryClasses(category) {
      return ["category-title", this.currentCategory === category ? "selected" : null];
    },
    onScroll(event) {
      this.tabsShouldStick = event && event.target.scrollTop > 48;
    }
  }
};
</script>
<style lang="scss" scoped>

.categories {
  display: flex;
  padding: 0 4px;
  justify-content: space-between;
  width: 100%;
  .category-title {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: 12px;
    flex: 0;
  }
  .category-title.selected,
  .category-title.selected .v-icon,
  .category-title:hover .v-icon {
    font-weight: bold;
    color: black;
  }

}
</style>
