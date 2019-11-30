<template>
  <div class="project-timeline">
    <template v-if="!$subReady.project">
      <v-progress-linear indeterminate />
    </template>
    <template v-if="$subReady.project && project">
      <project-filters-dialog
        :active.sync="showFiltersDialog"
        :project-id="project._id"
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
          :project-id="project._id"
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
          :items="getItems()"
          :groups="getGroups()"
          :options="timeline.options"
          @select="onSelectTask"
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
import { mapState } from "vuex";

import moment from "moment";

export default {
  components: {
    Timeline
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
      selectedTask: {},
      filterName: "",
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
    ...mapState("projectFilters", {
      selectedLabels: (state) => state.selectedLabels,
      selectedAssignedTos: (state) => state.selectedAssignedTos,
      selectedUpdatedBy: (state) => state.selectedUpdatedBy
    })
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.$events.listen("filter-tasks", (name) => {
      this.filterName = name;
    });
  },
  beforeDestroy() {
    this.$events.off("filter-tasks");
    this.$store.dispatch("setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      project: function() {
        return [this.projectId];
      }
    },
    project() {
      return Projects.findOne();
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
    getGroups() {
      const lists = Lists.find({});
      const groups = [];

      groups.push({
        id: 0,
        content: "Projet"
      });

      lists.forEach((list) => {
        const group = {
          id: list._id,
          content: list.name,
          subgroupStack: true
        };
        groups.push(group);
      });
      return groups;
    },

    getItems() {
      const items = [];
      const { tasks } = this;

      if (this.project.startDate) {
        items.push({
          id: "start",
          content: this.getStartContent(),
          start: moment(this.project.startDate).toDate(),
          type: "box",
          group: 0
        });
      }

      if (this.project.endDate) {
        items.push({
          id: "end",
          content: this.getEndContent(),
          start: moment(this.project.endDate).toDate(),
          type: "box",
          group: 0
        });
      }

      tasks.forEach((task) => {
        let start = moment(task.startDate).toDate();
        let end = moment(task.dueDate).toDate();

        const { completed } = task;
        const { completedAt } = task;

        if (completed && completedAt) {
          end = completedAt;
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
          type: type
        };
        items.push(item);
      });
      setTimeout(() => {
        if (this.$refs.timeline && this.$refs.timeline.redraw) {
          this.$refs.timeline.redraw();
        }
      }, 1000);

      return items;
    },

    onSelectTask(data) {
      const { items } = data;
      if (items && items.length > 0) {
        if (items[0] === "start" || items[0] === "end") {
          this.$store.dispatch("showTaskDetail", false);
          return;
        }
        const task = Tasks.findOne({ _id: items[0] });
        this.$store.dispatch("selectTask", task);
        this.$store.dispatch("showTaskDetail", true);
      } else {
        this.$store.dispatch("selectTask", null);
        this.$store.dispatch("showTaskDetail", false);
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

    getTaskContent(task) {
      const { name } = task;
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${name}</div>`;
    },

    getStartContent() {
      const start = this.$t("Start date");
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${start}</div>`;
    },

    getEndContent() {
      const end = this.$t("End date");
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${end}</div>`;
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

.project-timeline {
  background-color: white;
}
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
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
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
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
