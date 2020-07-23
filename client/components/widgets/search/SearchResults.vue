<template>
  <v-card class="search-results" :width="width">
    <v-tabs
      v-if="filter"
      v-model="tab"
      grow
      show-arrows
      light
      background-color="white"
      class="tabs"
    >
      <v-tabs-slider color="accent" />
      <v-tab>
        <v-icon left>
          mdi-format-list-bulleted
        </v-icon>
        {{ $t("Tasks") }} ({{ taskCount }})
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-clipboard-pulse-outline
        </v-icon>
        {{ $t("Projects") }} ({{ projectCount }})
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-calendar-star
        </v-icon>
        {{ $t("meetings.meetings") }} ({{ meetingCount }})
      </v-tab>
      <v-tab>
        <v-icon left>
          mdi-attachment
        </v-icon>
        {{ $t("attachments.attachments") }} ({{ attachmentCount }})
      </v-tab>
      <!-- Tasks -->
      <v-tab-item eager :transition="false" :reverse-transition="false">
        <search-tasks
          :project-id="currentProjectId"
          :organization-id="currentOrganizationId"
          :filter="filterTasks"
          :task-count.sync="taskCount"
          @select="onSelectTask"
        />
      </v-tab-item>
      <!-- Projects -->
      <v-tab-item eager :transition="false" :reverse-transition="false">
        <search-projects
          :organization-id="currentOrganizationId"
          :filter="filterProjects"
          :project-count.sync="projectCount"
          @select="onSelectProject"
        />
      </v-tab-item>
      <!-- Meetings -->
      <v-tab-item eager :transition="false" :reverse-transition="false">
        <search-meetings
          :project-id="currentProjectId"
          :organization-id="currentOrganizationId"
          :filter="filterMeetings"
          :meeting-count.sync="meetingCount"
          @select="onSelectMeeting"
        />
      </v-tab-item>
      <!-- Attachments (@select open attachment in new tab) -->
      <v-tab-item eager :transition="false" :reverse-transition="false">
        <search-attachments
          :project-id="currentProjectId"
          :filter="filterAttachments"
          :attachment-count.sync="attachmentCount"
        />
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    filter: {
      type: String,
      default: ""
    },
    width: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tab: 0,
      filterTasks: "",
      filterProjects: "",
      filterAttachments: "",
      filterMeetings: "",
      taskCount: 0,
      projectCount: 0,
      attachmentCount: 0,
      meetingCount: 0
    };
  },
  computed: {
    ...mapState("project", ["currentProjectId"]),
    ...mapState("organization", ["currentOrganizationId"])
  },
  watch: {
    page() {
      this.find();
    },
    tab() {
      this.find();
    },
    filter: {
      immediate: true,
      handler() {
        this.find();
      }
    }
  },
  methods: {
    find() {
      this.filterTasks = this.filter;
      this.filterProjects = this.filter;
      this.filterAttachments = this.filter;
      this.filterMeetings = this.filter;
    },

    onSelectTask(task) {
      if (!task) return;
      this.$router.push({
        name: "project-task",
        params: {
          projectId: task.projectId,
          taskId: task._id
        }
      });
      this.$emit("update:active", false);
    },

    onSelectProject(project) {
      if (!project) return;
      this.$router.push({
        name: "project-dashboard",
        params: {
          projectId: project._id
        }
      });
      this.$emit("update:active", false);
    },
    onSelectMeeting(meeting) {
      if (!meeting) return;
      this.$router.push({
        name: "meetings",
        params: {
          projectId: meeting.projectId,
          meetingId: meeting._id
        }
      });
      this.$emit("update:active", false);
    }
  }
};
</script>

<style scoped>
.tabs {
  border-radius: 0px !important;
}
.search-results >>> .v-list {
  padding: 0 !important;
}
</style>
