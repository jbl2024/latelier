<template>
  <div class="projects-timeline">
    <template v-if="!$subReady.projectsForTimeline">
      <v-progress-linear indeterminate />
    </template>

    <template v-if="$subReady.projectsForTimeline">
      <empty-state
        v-show="count == 0"
        icon="mdi-chart-timeline-variant"
        :label="$t('No project')"
        :description="$t('Projects with start and end date are displayed here')"
      />

      <v-toolbar dense class="toolbar flex0">
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
          @select="onSelectProject"
        />
      </div>
      <v-navigation-drawer
        v-model="showDrawer"
        class="elevation-16 panel"
        :width="$vuetify.breakpoint.xsOnly ? '100%' : '256px'"
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
        />
      </v-navigation-drawer>
    </template>
  </div>
</template>

<script>
import { Projects, ProjectStates } from "/imports/api/projects/projects.js";

import { colors } from "/imports/colors.js";

import { mapState } from "vuex";
import { Timeline } from "vue2vis";
import debounce from "lodash/debounce";
import moment from "moment";

export default {
  components: {
    Timeline
  },
  props: {
    organizationId: {
      type: String,
      default: null
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
          moment: (date) => {
            if (moment.locale() !== this.$i18n.locale) { moment.locale(this.$i18n.locale); }
            return moment(date);
          },
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
  computed: {
    ...mapState(["selectedGroup"])
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.filter = val;
    }, 400);
  },
  mounted() {
    this.$store.dispatch("setCurrentOrganizationId", this.organizationId);
    this.$store.dispatch("setShowCategories", true);
    this.$events.listen("close-project-detail", () => {
      this.showProjectDetail = false;
    });
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentOrganizationId", null);
    this.$store.dispatch("setShowCategories", false);
    this.$events.off("close-project-detail");
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
      Object.keys(ProjectStates).forEach((state) => {
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
      this.projects.forEach((project) => {
        const item = {
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
      const { name } = project;
      const color = project.color || "";
      if (color !== "") {
        return `<div class="timeline-custom-item" style="background-color: ${color}; color: ${colors.getLabelColor(
          color
        )}">${name}</div>`;
      }
      return `<div class="timeline-custom-item timeline-custom-item-default-colors" style="background-color: ${color}">${name}</div>`;
    },

    onSelectProject(data) {
      const { items } = data;
      if (items && items.length > 0) {
        const projectId = items[0];
        this.showDrawer = true;
        this.selectedProject = Projects.findOne({ _id: projectId });
      }
    },
    deselectGroup() {
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
      Meteor.call(
        "projects.setDatesAndState",
        {
          projectId: item.id,
          startDate: moment(item.start).format("YYYY-MM-DD HH:mm"),
          endDate: moment(item.end).format("YYYY-MM-DD HH:mm"),
          state: item.group
        },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            cb(null);
            return;
          }
          this.refreshSelectedProject();
          cb(item);
        }
      );
    },

    refreshSelectedProject() {
      if (this.selectedProject) {
        this.$refs.timeline.focus(this.selectedProject._id);
        this.selectedProject = Projects.findOne({
          _id: this.selectedProject._id
        });
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
