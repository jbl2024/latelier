<template>
  <div class="project-timeline">

    <div v-if="!$subReady.project">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.project">
      <div class="progress" v-if="showProgress && count > 0">
        <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      </div>
      <empty-state v-show="count == 0" icon="mdi-chart-timeline-variant" label="Aucune tache" description="Seules les taches avec une date de début ou de fin sont affichées ici.">
      </empty-state>

      <div class="timeline">
        <timeline ref="timeline" :items="getItems()" :groups="getGroups()" :options="timeline.options" @changed="onTimelineChanged" @rangechanged="onTimelineRangeChanged" @select="onSelectTask">
        </timeline>
      </div>

    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import debounce from "lodash/debounce";
import { Timeline } from "vue2vis";

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
        options: {}
      },
      showProgress: true,
      rangeChanged: false
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
          content: list.name
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
          content: "Début",
          start: this.project.startDate,
          type: "box",
          group: 0
        });
      }

      if (this.project.endDate) {
        items.push({
          id: "end",
          content: "Fin",
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
          content: task.name,
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

    onTimelineChanged() {
      if (this.rangeChanged) {
        this.showProgress = false;
      }
    },

    onTimelineRangeChanged() {
      this.rangeChanged = true;
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
  flex:1;
  position: relative;
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