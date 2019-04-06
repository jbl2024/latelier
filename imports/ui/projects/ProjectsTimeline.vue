<template>
  <div class="projects-timeline">

    <template v-if="!$subReady.projectsForTimeline">
      <v-progress-linear indeterminate></v-progress-linear>
    </template>

    <template v-if="$subReady.projectsForTimeline">
      <empty-state v-show="count == 0"
        icon="timeline"
        :label="$t('No project')"
        :description="$t('Projects with start and end date are displayed here')">
      </empty-state>
      
      <div class="progress" v-if="showProgress && count > 0">
        <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
      </div>
      <div class="timeline">
        <timeline
          ref="timeline"
          :items="getItems()"
          :groups="getGroups()"
          :options="timeline.options"
          @changed="onTimelineChanged"
          @rangechanged="onTimelineRangeChanged"
          @select="onSelectProject">
        </timeline>
      </div>
    </template>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';
import { ProjectStates } from "/imports/api/projects/projects.js";
import { Timeline } from 'vue2vis';
import debounce from 'lodash/debounce';
import { mapState } from 'vuex';

export default {
  components: {
    Timeline,
  },  
  created () {
    this.debouncedFilter = debounce((val) => { this.filter = val}, 400);
  },
  mounted () {
    this.$store.dispatch('setCurrentOrganizationId', this.organizationId);    
    this.$store.dispatch('setShowCategories', true);    
    this.$events.listen('close-project-detail', task => {
      this.showProjectDetail = false;
    });
  },
  beforeDestroy() {
    this.$store.dispatch('setCurrentOrganizationId', 0);    
    this.$store.dispatch('setShowCategories', false);    
    this.$events.off('close-project-detail');
  },
  computed: {
    ...mapState(['selectedGroup'])
  },
  props: {
    organizationId: {
      type: String,
      default: '0'
    }
  },
  i18n: {
    messages: {
      en: {
        "No project": "No project",
        "Projects with start and end date are displayed here": "Projects with start and end date are displayed here"
      },
      fr: {
        "No project": "Aucun projet",
        "Projects with start and end date are displayed here": "Seuls les projets avec une date de début et une date de fin sont affichés ici"
      }
    }
  },
  data () {
    return {
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      showProgress: true,
      rangeChanged: false,
      filter: '',
      debouncedFilter: '',
      projectId: '',
      showProjectDetail: false,
      enableData: false,
      timeline: {
        groups: [
          {
            id: 0,
            content: 'En cours',
          },
        ],
        options: {
        },
      },
      selectedProjectId: null
    }
  },
  methods: {
    getGroups () {
      const states = []
      Object.keys(ProjectStates).map(state => {
        states.push({
          id: ProjectStates[state],
          content: this.$t(`projects.state.${state}`)
        })
      });
      return states;
    },
    getItems () {
      var items = [];
      this.projects.map (project => {
        var item = {
          id: project._id,
          group: project.state,
          content: this.getProjectContent(project),
          className: 'item',
          start: project.startDate,
          end: project.endDate
        }
        items.push(item);
      });
      return items;
    },

    getProjectContent (project) {
      var name = project.name;
      var color = project.color || '';
      return `<div style="margin:0; padding:5px; background-color: ${color}">${name}</div>`
    },

    onSelectProject (data) {
      var items = data.items;
      if (items && items.length > 0) {
        const projectId = items[0];
        this.$router.push({
          name: "project",
          params: { projectId: projectId }
        });
      }
    },
    deselectGroup (str, index) {
      this.$store.dispatch('setSelectedGroup', null);
    },

    onTimelineChanged () {
      if (this.rangeChanged) {
        this.showProgress = false;
      }
    },

    onTimelineRangeChanged () {
      this.rangeChanged = true;
    }    
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'projectsForTimeline': function() {
        return [this.organizationId, this.filter, this.$store.state.selectedGroup._id];
      },
      organization: function() {
        return [this.organizationId];
      },
      projectGroups: function() {
        return [this.organizationId];
      }
    },
    projects () {
      return Projects.find({}, {sort: {name: 1}});
    },
    count () {
      return Projects.find().count();
    }    
  },
}
</script>

<style scoped>

.projects-timeline {
  background-color: white;
}

.timeline {
  margin-top: 24px;
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
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}

 .vis-item .vis-item-overflow {
  overflow: visible;
}

</style>