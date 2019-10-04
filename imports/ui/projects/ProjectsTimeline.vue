<template>
  <div class="projects-timeline">
    <template v-if="!$subReady.projectsForTimeline">
      <v-progress-linear indeterminate></v-progress-linear>
    </template>

    <template v-if="$subReady.projectsForTimeline">
      <empty-state
        v-show="count == 0"
        icon="mdi-chart-timeline-variant"
        :label="$t('No project')"
        :description="$t('Projects with start and end date are displayed here')"
      ></empty-state>

      <v-toolbar dense class="toolbar flex0">
        <tooltip-button bottom icon="mdi-calendar-today" :tooltip="$t('Today')" @on="gotoToday()"></tooltip-button>
        <v-divider vertical></v-divider>
        <tooltip-button bottom icon="mdi-magnify" :tooltip="$t('Reset zoom')" @on="zoomReset()"></tooltip-button>
        <tooltip-button bottom icon="mdi-magnify-minus" :tooltip="$t('Zoom out')" @on="zoomOut()"></tooltip-button>
        <tooltip-button bottom icon="mdi-magnify-plus" :tooltip="$t('Zoom in')" @on="zoomIn()"></tooltip-button>
        <v-divider vertical></v-divider>
      </v-toolbar>

      <div class="flex1" v-resize="onResizeTimelineContainer" ref="timelineContainer">
        <timeline
          ref="timeline"
          :items="getItems()"
          :groups="getGroups()"
          :options="timeline.options"
          @select="onSelectProject"
        ></timeline>
      </div>
      <v-navigation-drawer
        :clipped="$vuetify.breakpoint.lgAndUp"
        class="elevation-16 panel"
        v-model="showDrawer"
        absolute
        stateless
        right
        fixed
      >
          <project-detail
            v-if="selectedProject"
            :project="selectedProject"
            :active.sync="showDrawer"
            @refresh="refreshSelectedProject()"
          ></project-detail>
      </v-navigation-drawer>
    </template>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { ProjectStates } from "/imports/api/projects/projects.js";
import { colors } from '/imports/colors.js'

import { mapState } from "vuex";
import { Timeline } from "vue2vis";
import debounce from "lodash/debounce";
import moment from "moment";

export default {
  components: {
    Timeline
  },
  created() {
    this.debouncedFilter = debounce(val => {
      this.filter = val;
    }, 400);
  },
  mounted() {
    this.$store.dispatch("setCurrentOrganizationId", this.organizationId);
    this.$store.dispatch("setShowCategories", true);
    this.$events.listen("close-project-detail", task => {
      this.showProjectDetail = false;
    });
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentOrganizationId", 0);
    this.$store.dispatch("setShowCategories", false);
    this.$events.off("close-project-detail");
  },
  computed: {
    ...mapState(["selectedGroup"])
  },
  props: {
    organizationId: {
      type: String,
      default: "0"
    }
  },
  i18n: {
    messages: {
      en: {
        "Projects with start and end date are displayed here":
          "Projects with start and end date are displayed here"
      },
      fr: {
        "Projects with start and end date are displayed here":
          "Seuls les projets avec une date de début et une date de fin sont affichés ici"
      }
    }
  },
  data() {
    return {
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      showDrawer: false,
      filter: "",
      debouncedFilter: "",
      projectId: "",
      showProjectDetail: false,
      enableData: false,
      timeline: {
        groups: [
          {
            id: 0,
            content: "En cours"
          }
        ],
        options: {
          orientation: "top",
          zoomKey: "ctrlKey",
          zoomMax: 31556952000 * 3, // 4 years
          zoomMin: 24 * 1000 * 60 * 60, // 24 hours
          editable: {
            updateTime: true,
            updateGroup: true,
            remove: false
          },
          onMove: (item, callback) => {
            this.handleMove(item, callback);
          }
        }
      },
      selectedProject: null
    };
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      projectsForTimeline: function() {
        return [
          this.organizationId,
          this.filter,
          this.$store.state.selectedGroup._id
        ];
      },
      organization: function() {
        return [this.organizationId];
      },
      projectGroups: function() {
        return [this.organizationId];
      }
    },
    projects() {
      return Projects.find(
        { organizationId: this.organizationId },
        { sort: { name: 1 } }
      );
    },
    count() {
      return Projects.find({ organizationId: this.organizationId }).count();
    }
  },
  methods: {
    getGroups() {
      const states = [];
      Object.keys(ProjectStates).map(state => {
        states.push({
          id: ProjectStates[state],
          subgroupStack: true,
          content: this.$t(`projects.state.${state}`)
        });
      });
      return states;
    },
    getItems() {
      const defaultBefore = moment().subtract(1, "weeks");
      const defaultAfter = moment().add(1, "weeks");
      const items = [];
      this.projects.map(project => {
        var item = {
          id: project._id,
          group: project.state,
          subgroup: project._id,
          content: this.getProjectContent(project),
          className: "item",
          start: project.startDate || defaultBefore,
          end: project.endDate || defaultAfter
        };
        items.push(item);
      });
      return items;
    },

    getProjectContent(project) {
      var name = project.name;
      var color = project.color || "";
      if (color !== "") {
        return `<div class="timeline-custom-item" style="background-color: ${color}; color: ${colors.getLabelColor(color)}">${name}</div>`;
      } 
      return `<div class="timeline-custom-item timeline-custom-item-default-colors" style="background-color: ${color}">${name}</div>`;
    },

    onSelectProject(data) {
      var items = data.items;
      if (items && items.length > 0) {
        const projectId = items[0];
        this.showDrawer = true;
        this.selectedProject = Projects.findOne({ _id: projectId });
      }
    },
    deselectGroup(str, index) {
      this.$store.dispatch("setSelectedGroup", null);
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

    handleMove(item, cb) {
      Meteor.call("projects.setDatesAndState", {
        projectId: item.id,
        startDate: moment(item.start).format("YYYY-MM-DD HH:mm"),
        endDate: moment(item.end).format("YYYY-MM-DD HH:mm"),
        state: item.group
      }, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          cb(null)
          return;
        }
        this.refreshSelectedProject();
        cb(item);
      });
    },

    refreshSelectedProject() {
      if (this.selectedProject) {
        this.$refs.timeline.focus(this.selectedProject._id);
        this.selectedProject = Projects.findOne({_id: this.selectedProject._id});
      }
    }
  }
};
</script>

<style scoped>
.projects-timeline {
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

.progress {
  margin-top: 32px;
  text-align: center;
}

.search {
  max-width: 300px;
}

.categories {
  margin-left: 12px;
}

.drawer-project-detail {
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.vis-item .vis-item-overflow {
  overflow: visible;
}

.panel {
  z-index: 4;
}

</style>