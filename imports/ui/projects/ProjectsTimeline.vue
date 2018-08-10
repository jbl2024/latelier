<template>
  <div class="projects-timeline">

    <md-toolbar class="toolbar">
      <md-button class="md-icon-button" :to="{ name: 'projects'}">
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
          :options="timeline.options">
        </timeline>
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from '/imports/api/projects/projects.js';
import { Timeline } from 'vue2vis';
import debounce from 'lodash/debounce';

export default {
  data () {
    return {
      showConfirmDialog: false,
      showConfirmCloneDialog: false,
      filter: '',
      debouncedFilter: '',
      projectId: '',
      timeline: {
        groups: [
          {
            id: 0,
            content: 'Group 1',
          },
        ],
        items: [
          { id: 2, group: 0, content: 'item 2', start: '2014-04-14' },
          { id: 3, group: 0, content: 'item 3', start: '2014-04-18' },
          { id: 1, group: 0, content: 'item 1', start: '2014-04-20' },
          {
            id: 4,
            group: 0,
            content: 'item 4',
            start: '2014-04-16',
            end: '2014-04-19',
          },
          { id: 5, group: 0, content: 'item 5', start: '2014-04-25' },
          {
            id: 6,
            group: 0,
            content: 'item 6',
            start: '2014-04-27',
            type: 'point',
          },
        ],
        options: {
        },
      },
    }
  },
  created () {
    this.debouncedFilter = debounce((val) => { this.filter = val}, 400);
  },
  components: {
    Timeline,
  },  
  methods: {
    getItems () {
      var items = [];
      this.projects.map (project => {
        var item = {
          id: project._id,
          group: 0,
          content: project.name,
          start: project.startDate,
          end: project.endDate
        }
        items.push(item);
      });
      return items;
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