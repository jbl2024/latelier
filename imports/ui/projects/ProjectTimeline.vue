<template>
  <div class="project-timeline">

    <template v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </template>
    <template v-if="$subReady.project">
      <empty-state v-show="count == 0" icon="mdi-chart-timeline-variant" label="Aucune tache" description="Seules les taches avec une date de début ou de fin sont affichées ici.">
      </empty-state>

      <v-toolbar dense class="toolbar flex0">
        <tooltip-button bottom icon="mdi-calendar-today" :tooltip="$t('Today')" @on="gotoToday()"></tooltip-button>
        <v-divider vertical></v-divider>
        <tooltip-button bottom icon="mdi-magnify" :tooltip="$t('Reset zoom')" @on="zoomReset()"></tooltip-button>
        <tooltip-button bottom icon="mdi-magnify-minus" :tooltip="$t('Zoom out')" @on="zoomOut()"></tooltip-button>
        <tooltip-button bottom icon="mdi-magnify-plus" :tooltip="$t('Zoom in')" @on="zoomIn()"></tooltip-button>
        <v-divider vertical></v-divider>
      </v-toolbar>

      <div class="flex1" v-resize="onResizeTimelineContainer" ref="timelineContainer">
        <timeline ref="timeline" :items="getItems()" :groups="getGroups()" :options="timeline.options" @select="onSelectTask">
        </timeline>
      </div>

    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Timeline } from "vue2vis";

import debounce from "lodash/debounce";
import moment from "moment";

export default {
  components: {
    Timeline
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
    this.$events.listen("close-task-detail", task => {
      this.$store.dispatch('selectTask', null);
      this.$store.dispatch('showTaskDetail', false);
    });
  },
  created() {
    this.debouncedFilter = debounce(val => {
      this.filterName = val;
    }, 400);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
    this.$store.dispatch('selectTask', null);
    this.$store.dispatch('showTaskDetail', false);
    this.$events.off("close-task-detail");
  },
  props: {
    projectId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      showTaskDetail: false,
      selectedTask: {},
      debouncedFilter: "",
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
            if (moment.locale() !== this.$i18n.locale) moment.locale(this.$i18n.locale);
            return moment(date);
          },
          orientation: "top",
          zoomKey: "ctrlKey",
          zoomMax: 31556952000 * 3, // 4 years
          zoomMin: 1 * 1000 * 60 * 60, // 1 hour,
          // editable: {
          //   updateTime: true,
          //   updateGroup: true,
          //   remove: false
          // }
        }
      },
    };
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
          projectId: this.projectId
        };
      },
      deep: false,
      update({ name, projectId }) {
        var query = {
          projectId: this.projectId,
          $or: [{ startDate: { $ne: null } }, { dueDate: { $ne: null } }]
        };

        if (name && name.length > 0) {
          query.name = { $regex: ".*" + name + ".*", $options: "i" };
        }
        return Tasks.find(query);
      }
    },
    count: {
      params() {
        return {
          projectId: this.projectId
        };
      },
      update({ projectId }) {
        var query = {
          projectId: this.projectId,
          $or: [{ startDate: { $ne: null } }, { dueDate: { $ne: null } }]
        };
        return Tasks.find(query);
      }
    },
  },
  methods: {
    getGroups() {
      const lists = Lists.find({});
      const groups = [];

      groups.push({
        id: 0,
        content: "Projet"
      });

      lists.map(list => {
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
      var items = [];
      var tasks = this.tasks;

      if (this.project.startDate) {
        items.push({
          id: "start",
          content: this.getStartContent(),
          start: this.project.startDate,
          type: "box",
          group: 0
        });
      }

      if (this.project.endDate) {
        items.push({
          id: "end",
          content: this.getEndContent(),
          start: this.project.endDate,
          type: "box",
          group: 0
        });
      }

      tasks.map(task => {
        var start = task.startDate;
        var end = task.dueDate;
        var type = "range";

        if (!start || !end) {
          type = "point";
        }

        if (!start) {
          start = end;
        }
        var item = {
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
      var items = data.items;
      if (items && items.length > 0) {
        if (items[0] === "start" || items[0] === "end") {
          this.$events.fire("close-task-detail");
          return;
        }
        var task = Tasks.findOne({ _id: items[0] });
        this.$store.dispatch('selectTask', task);
        this.$store.dispatch('showTaskDetail', true);
      } else {
        this.$store.dispatch('selectTask', null);
        this.$store.dispatch('showTaskDetail', false);
      }
      return;
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
      const name = task.name;
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${name}</div>`;
    },

    getStartContent() {
      const start = this.$t('Start');
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${start}</div>`;
    },

    getEndContent() {
      const end = this.$t('End');
      return `<div class="timeline-custom-item timeline-custom-item-default-colors">${end}</div>`;
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