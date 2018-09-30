<template>
  <div class="projects-timeline">

    <md-toolbar class="toolbar">
      <md-button class="md-icon-button" :to="{ name: 'projects-page'}">
          <md-icon>home
            <md-tooltip md-delay="300">Accueil</md-tooltip>
          </md-icon>
      </md-button>
      <span class="md-title">
        Planning
      </span>        
      <span class="categories"><md-chip v-show="selectedGroup._id" class="md-primary" md-deletable @md-delete="deselectGroup">{{ selectedGroup.name }}</md-chip></span>

      <div class="md-toolbar-section-end">
        <md-field class="search" md-clearable>
          <md-icon>search</md-icon>
          <md-input placeholder="Rechercher..." v-on:input="debouncedFilter"/>
        </md-field>

      </div>
    </md-toolbar>

    <template v-if="!$subReady.projectsForTimeline">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </template>

    <template v-if="$subReady.projectsForTimeline">
      
      <div class="progress" v-if="showProgress">
        <md-progress-spinner md-mode="indeterminate" ></md-progress-spinner>
      </div>
      <div class="timeline">
        <timeline
          ref="timeline"
          :items="getItems()"
          :groups="timeline.groups"
          :options="timeline.options"
          @changed="onTimelineChanged"
          @rangechanged="onTimelineRangeChanged"
          @select="onSelectProject">
        </timeline>
      </div>


      <md-drawer :md-active="showProjectDetail" md-right md-persistent="full" class="drawer-project-detail md-layout-item md-xsmall-size-100 md-medium-size-30 md-large-size-30 md-xlarge-size-30">
        <project-detail :projectId="selectedProjectId" v-if="selectedProjectId"></project-detail>
      </md-drawer>

      <md-empty-state v-show="count == 0"
        md-icon="timeline"
        md-label="Aucun projet"
        md-description="Seuls les projets avec une date de début et de fin sont affichés ici.">
      </md-empty-state>
    </template>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';
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
    this.$store.dispatch('setShowCategories', true);    
    this.$events.listen('close-project-detail', task => {
      this.showProjectDetail = false;
    });
  },
  beforeDestroy() {
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
    getItems () {
      var items = [];
      this.projects.map (project => {
        var item = {
          id: project._id,
          group: 0,
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
        this.selectedProjectId = items[0];
        this.showProjectDetail = true;
      } else {
        this.selectedProjectId = null;
        this.showProjectDetail = false;
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
        return [this.organizationId, this.filter, this.$store.state.selectedGroup._id] // Subscription params
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

.toolbar {
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

.projects-timeline {
  min-height: calc(100vh - 64px);
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