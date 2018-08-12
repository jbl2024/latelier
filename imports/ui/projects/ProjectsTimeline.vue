<template>
  <div class="projects-timeline">

    <md-toolbar class="toolbar">
      <md-button class="md-icon-button" :to="{ name: 'projects-page'}">
          <md-icon>home
            <md-tooltip md-delay="300">Accueil</md-tooltip>
          </md-icon>
      </md-button>
      <span class="md-title">
        Timeline
      </span>        

      <div class="md-toolbar-section-end">
        <md-field class="search" md-clearable>
          <md-icon>search</md-icon>
          <md-input placeholder="Rechercher..." v-on:input="debouncedFilter"/>
        </md-field>

      </div>
    </md-toolbar>

    <div v-if="!$subReady.projectsForTimeline">
      <md-progress-bar md-mode="indeterminate"></md-progress-bar>
    </div>

    <div v-if="$subReady.projectsForTimeline">

      <div class="timeline">
        <timeline
          ref="timeline"
          :items="getItems()"
          :groups="timeline.groups"
          :options="timeline.options"
          @select="onSelectProject">
        </timeline>
      </div>

      <md-drawer :md-active="showProjectDetail" md-right md-persistent="full" class="drawer-task-detail md-layout-item md-xsmall-size-100 md-medium-size-30 md-large-size-30 md-xlarge-size-30">
        <project-detail :projectId="selectedProjectId" v-if="selectedProjectId"></project-detail>
      </md-drawer>

    </div>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';
import { Timeline } from 'vue2vis';
import debounce from 'lodash/debounce';

export default {
  components: {
    Timeline,
  },  
  created () {
    this.debouncedFilter = debounce((val) => { this.filter = val}, 400);
  },
  mounted () {
    this.$events.listen('close-project-detail', task => {
      this.showProjectDetail = false;
    });
  },
  beforeDestroy() {
    this.$events.off('close-project-detail');
  },
  data () {
    return {
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      filter: '',
      debouncedFilter: '',
      projectId: '',
      showProjectDetail: false,
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
          start: project.startDate,
          end: project.endDate
        }
        items.push(item);
      });
      return items;
    },

    getProjectContent (project) {
      return project.name;
    },

    onSelectProject (data) {
      var items = data.items;
      if (items && items.length > 0) {
        this.selectedProjectId = items[0];
        this.showProjectDetail = true;
        this.$refs.timeline.focus(items[0]);
      } else {
        this.selectedProjectId = null;
        this.showProjectDetail = false;
      }
    }
    
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      'projectsForTimeline': function() {
        return [this.filter] // Subscription params
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

.search {
  max-width: 300px;
}

</style>