<template>
  <div class="projects-timeline">
    <v-progress-linear v-if="!isReady" indeterminate />
    <template v-else>
      <projects-timeline-toolbar
        :organization-id="organizationId"
        :show-categories="showCategories"
        @go-to-today="gotoToday"
        @zoom-reset="zoomReset"
        @zoom-out="zoomOut"
        @zoom-in="zoomIn"
      />
      <empty-state
        v-show="count == 0"
        icon="mdi-chart-timeline-variant"
        :label="$t('No project')"
        full-page
        :description="$t('Projects with start and end date are displayed here')"
      />
      <div
        ref="timelineContainer"
        v-resize="onResizeTimelineContainer"
        class="flex1"
      >
        <timeline
          :key="organizationId"
          ref="timeline"
          :items="items"
          :groups="groups"
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
import { Projects, ProjectVisibleStates } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import { colors } from "/imports/colors.js";
import { mapState } from "vuex";
import { Timeline } from "vue2vis";
import debounce from "lodash/debounce";
import moment from "moment";
import DatesMixin from "/imports/ui/mixins/DatesMixin";
import ProjectsTimelineToolbar from "/imports/ui/projects/ProjectsTimelineToolbar";

export default {
  components: {
    Timeline,
    ProjectsTimelineToolbar
  },
  mixins: [DatesMixin],
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
            if (moment.locale() !== this.$i18n.locale) {
              moment.locale(this.$i18n.locale);
            }
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
    ...mapState(["showCategories", "selectedGroup"]),
    isReady() {
      return this.$subReady.projectsForTimeline;
    },
    items() {
      if (!this.$subReady.projectsForTimeline || !this.organizationId) return [];
      const defaultBefore = moment().subtract(1, "weeks");
      const defaultAfter = moment().add(1, "weeks");
      return this.projects.map((project) => ({
        id: project._id,
        group: project.state,
        subgroup: project._id,
        content: this.getProjectContent(project),
        className: "item",
        start: moment(project.startDate).toDate() || defaultBefore,
        end: moment(project.endDate).toDate() || defaultAfter
      }));
    },
    groups() {
      const states = [];
      Object.keys(ProjectVisibleStates).forEach((state) => {
        states.push({
          id: ProjectVisibleStates[state],
          subgroupStack: true,
          content: this.$t(`projects.state.${state}`)
        });
      });
      return states;
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.filter = val;
    }, 400);
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProject", null);
    this.$store.dispatch(
      "organization/setCurrentOrganizationId",
      this.organizationId
    );
    this.$store.dispatch("setShowCategories", true);
    this.$events.listen("close-project-detail", () => {
      this.showProjectDetail = false;
    });
  },
  beforeDestroy() {
    this.$store.dispatch("organization/setCurrentOrganizationId", null);
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
      projectsForTimeline() {
        return [
          this.organizationId,
          this.filter,
          this.$store.state.selectedGroup._id
        ];
      },
      organization() {
        return [this.organizationId];
      },
      projectGroups() {
        return [this.organizationId];
      }
    },
    projects: {
      params() {
        return {
          organizationId: this.organizationId
        };
      },
      update({ organizationId }) {
        return Projects.find(
          { organizationId: organizationId },
          { sort: { name: 1 } }
        );
      }
    },
    count: {
      params() {
        return {
          organizationId: this.organizationId
        };
      },
      update({ organizationId }) {
        return Projects.find({ organizationId: organizationId }).count();
      }
    },
    organization() {
      const organization = Organizations.findOne();
      if (organization) {
        this.$store.dispatch(
          "organization/setCurrentOrganization",
          organization
        );
      }
      return organization;
    }
  },
  methods: {
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
          startDate: this.formatDateTz(item.start),
          endDate: this.formatDateTz(item.end),
          state: item.group
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
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
