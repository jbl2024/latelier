<template>
  <div class="project-timeline">
    <template v-if="!$subReady">
      <v-progress-linear indeterminate />
    </template>
    <template v-else-if="$subReady.project && currentProject && currentProject._id">
      <meeting
        :is-shown.sync="showSelectedMeeting"
        :meeting="selectedMeeting"
        :edit="false"
      />
      <project-filters-dialog
        v-model="showFiltersDialog"
        :project-id="currentProject._id"
      />

      <v-toolbar
        ref="toolbar"
        v-resize="onResizeToolbar"
        dense
        class="toolbar flex0"
      >
        <tooltip-button
          bottom
          icon="mdi-calendar-today"
          :tooltip="$t('Today')"
          @on="gotoToday()"
        />
        <v-divider vertical />
        <tooltip-button
          bottom
          icon="mdi-magnify"
          :tooltip="$t('Reset zoom')"
          @on="zoomReset()"
        />
        <tooltip-button
          bottom
          icon="mdi-magnify-minus"
          :tooltip="$t('Zoom out')"
          @on="zoomOut()"
        />
        <tooltip-button
          bottom
          icon="mdi-magnify-plus"
          :tooltip="$t('Zoom in')"
          @on="zoomIn()"
        />
        <v-divider vertical />

        <v-btn v-if="showFilters" icon @click="showFiltersDialog = true">
          <v-icon>mdi-filter-variant</v-icon>
        </v-btn>

        <project-filters
          v-if="!showFilters"
          :project-id="currentProject._id"
          class="ml-3"
        />
      </v-toolbar>
      <div
        ref="timelineContainer"
        v-resize="onResizeTimelineContainer"
        class="flex1"
      >
        <timeline
          ref="timeline"
          :items="items"
          :groups="groups"
          :options="timeline.options"
          @items-update="refreshTimeline"
          @rangechange="updateRange"
          @select="onSelectItem"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Timeline } from "vue2vis";
import { mapState, mapGetters } from "vuex";
import Meeting from "/imports/ui/meetings/Meeting/Meeting";
import debounce from "lodash/debounce";
import moment from "moment";
import Api from "/imports/api/Api";

export default {
  components: {
    Timeline,
    Meeting
  },
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      showFilters: false,
      showFiltersDialog: false,
      showTaskDetail: false,
      showSelectedMeeting: false,
      selectedTask: {},
      filterName: "",
      meetings: [],
      selectedMeeting: null,
      startRange: null,
      endRange: null,
      timeline: {
        groups: [
          {
            id: 0,
            content: "En cours"
          }
        ],
        options: {
          moment: (date) => {
            if (moment.locale() !== this.$i18n.locale) { moment.locale(this.$i18n.locale); }
            return moment(date);
          },
          orientation: "top",
          zoomKey: "ctrlKey",
          zoomMax: 31556952000 * 3, // 4 years
          zoomMin: 1 * 1000 * 60 * 60 // 1 hour,
          // editable: {
          //   updateTime: true,
          //   updateGroup: true,
          //   remove: false
          // }
        }
      }
    };
  },
  computed: {
    ...mapState("project", ["currentProject"]),
    ...mapGetters("project", ["hasProjectFeature"]),
    ...mapState("project/filters", {
      selectedLabels: (state) => state.selectedLabels,
      selectedAssignedTos: (state) => state.selectedAssignedTos,
      selectedUpdatedBy: (state) => state.selectedUpdatedBy
    }),
    groups() {
      if (!this.$subReady.project || !this.currentProject) return [];
      const lists = Lists.find({});
      const projectGroups = [
        { id: 0, content: "Projet" }
      ];
      if (this.hasProjectFeature("meetings")) {
        projectGroups.push({ id: "meetings", content: "Réunions" });
      }
      const listsGroups = lists.map((list) => ({
        id: list._id,
        content: list.name,
        subgroupStack: true
      }));
      return projectGroups.concat(listsGroups);
    },
    items() {
      if (!this.$subReady.project || !this.currentProject) return [];
      const items = [];
      const { tasks } = this;

      if (this.currentProject.startDate) {
        items.push({
          id: "start",
          content: this.getStartContent(),
          start: moment(this.currentProject.startDate).toDate(),
          type: "box",
          group: 0
        });
      }

      if (this.currentProject.endDate) {
        items.push({
          id: "end",
          content: this.getEndContent(),
          start: moment(this.currentProject.endDate).toDate(),
          type: "box",
          group: 0
        });
      }

      tasks.forEach((task) => {
        let start = task.startDate ? moment(task.startDate).toDate() : null;
        let end = task.dueDate ? moment(task.dueDate).toDate() : null;

        const { completed, completedAt } = task;

        if (completed && completedAt) {
          end = moment(completedAt).toDate();
        }

        let type = "range";
        if (!start || !end) {
          type = "point";
        }

        if (!start) {
          start = end;
        }

        if (!start && !end) {
          return;
        }

        const item = {
          id: task._id,
          group: task.listId,
          subgroup: task._id,
          content: this.getTaskContent(task),
          start: start,
          end: end,
          itemType: "task",
          type: type
        };
        items.push(item);
      });

      if (this.hasProjectFeature("meetings") && this.meetings.length > 0) {
        this.meetings.forEach((meeting) => {
          const meetingStart = meeting.startDate ? moment(meeting.startDate).toDate() : null;
          const meetingEnd = meeting.endDate ? moment(meeting.endDate).toDate() : null;
          const type = "point";
          items.push({
            id: meeting._id,
            group: "meetings",
            content: this.getItemContent(meeting.name),
            start: meetingStart,
            end: meetingEnd,
            itemType: "meeting",
            type
          });
        });
      }
      return items;
    },
    meetingsParams() {
      return {
        projectId: this.projectId,
        page: 1,
        dates: [
          {
            start: moment(this.startRange).format("YYYY-MM-DD 00:00:00"),
            end: moment(this.endRange).format("YYYY-MM-DD 23:59:59")
          }
        ]
      };
    }
  },
  watch: {
    meetingsParams: {
      immediate: true,
      handler() {
        if (this.hasProjectFeature("meetings")) {
          this.fetchMeetings();
          this.refreshTimeline();
        }
      }
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    this.$events.listen("filter-tasks", (name) => {
      this.filterName = name;
    });
  },
  beforeDestroy() {
    this.$events.off("filter-tasks");
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
    },
    tasks: {
      params() {
        return {
          name: this.filterName,
          projectId: this.projectId,
          labels: this.selectedLabels,
          assignedTos: this.selectedAssignedTos,
          updatedBy: this.selectedUpdatedBy
        };
      },
      deep: false,
      update({ name, projectId, labels, assignedTos, updatedBy }) {
        const query = {
          projectId: projectId,
          $or: [
            { startDate: { $ne: null } },
            { dueDate: { $ne: null } },
            { completed: true }
          ]
        };

        if (name && name.length > 0) {
          query.name = { $regex: `.*${name}.*`, $options: "i" };
        }

        if (labels && labels.length > 0) {
          query.labels = {
            $in: labels.map((label) => label._id)
          };
        }

        if (assignedTos && assignedTos.length > 0) {
          query.assignedTo = {
            $in: assignedTos
          };
        }

        if (updatedBy && updatedBy.length > 0) {
          query.updatedBy = {
            $in: updatedBy
          };
        }

        return Tasks.find(query);
      }
    }
  },
  methods: {
    updateRange: debounce(function(datas) {
      this.startRange = datas.start;
      this.endRange = datas.end;
    }, 400),
    refreshTimeline() {
      if (this.$refs.timeline && this.$refs.timeline.redraw) {
        this.$refs.timeline.redraw();
      }
    },
    fetchMeetings() {
      if (!this.hasProjectFeature("meetings")) return;
      Api.call("meetings.findMeetings", this.meetingsParams).then((result) => {
        this.meetings = Array.isArray(result?.data) ? result.data : [];
      }).catch((error) => {
        this.$notifyError(error);
        this.meetings = [];
      });
    },
    clearSelectedTask() {
      this.$store.dispatch("selectTask", null);
      this.$store.dispatch("showTaskDetail", false);
    },
    clearSelectedMeeting() {
      this.selectedMeeting = null;
      this.showSelectedMeeting = false;
    },
    onSelectItem(data) {
      const { items } = data;
      if (items && items.length > 0) {
        if (items[0] === "start" || items[0] === "end") {
          this.$store.dispatch("showTaskDetail", false);
          return;
        }
        const itemId = items[0];
        const selectedItem = this.items.find((item) => item.id === itemId);
        if (selectedItem?.itemType) {
          if (selectedItem.itemType === "task") {
            this.clearSelectedMeeting();
            const task = Tasks.findOne({ _id: itemId });
            this.$store.dispatch("selectTask", task);
            this.$store.dispatch("showTaskDetail", true);
          } else if (selectedItem.itemType === "meeting") {
            this.clearSelectedTask();
            const selectedMeeting = this.meetings.find((meeting) => meeting._id === itemId);
            if (selectedMeeting) {
              this.selectedMeeting = selectedMeeting;
              this.showSelectedMeeting = true;
            }
          }
        }
      } else {
        this.clearSelectedMeeting();
        this.clearSelectedTask();
      }
    },

    gotoToday() {
      this.$refs.timeline.moveTo(new Date());
    },

    zoomOut() {
      this.$refs.timeline.zoomOut(0.4);
    },

    zoomIn() {
      this.$refs.timeline.zoomIn(0.4);
    },

    zoomReset() {
      this.$refs.timeline.fit();
    },

    onResizeTimelineContainer() {
      const height = this.$refs.timelineContainer.offsetHeight;
      this.$refs.timeline.setOptions({
        height: height
      });
    },
    getItemContent(innerContent) {
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${innerContent}</div>`;
    },
    getTaskContent(task) {
      return this.getItemContent(task.name);
    },
    getStartContent() {
      return this.getItemContent(this.$t("Start date"));
    },
    getEndContent() {
      return this.getItemContent(this.$t("End date"));
    },

    onResizeToolbar() {
      const toolbar = this.$refs.toolbar.$el;
      const width = toolbar.offsetWidth;
      if (width < 780) {
        this.showFilters = true;
      } else {
        this.showFilters = false;
      }
    }
  }
};
</script>

<style scoped>
.project-timeline {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
  background-color: white;
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
  overflow-y: auto;
}

.drawer-task-detail {
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.toolbar {
  background-color: white;
}

.search {
  max-width: 300px;
}

.edit-project-name input {
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.02em;
  margin-top: 6px;
  padding: 0;
  font-family: Inter, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
}

.timeline {
  margin-top: 24px;
}

.vis-item .vis-item-overflow {
  overflow: visible;
}

.progress {
  margin-top: 32px;
  text-align: center;
}
</style>
