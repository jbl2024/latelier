<template>
  <div class="project-info"> 
    <v-subheader>Description</v-subheader>
    <div class="elevation-1">
        <div class="description">
          <div v-show="project.description && project.description.length > 0">
            <div class="ql-editor-view" v-html="markDown(project.description)"></div>
          </div>
          <div v-show="!project.description">
            Aucune description
          </div>
        </div>
    </div>

    <v-subheader>Dates</v-subheader>
    <v-list two-line class="elevation-1">
        <v-list-tile>
          <v-list-tile-avatar>
            <v-icon>calendar_today</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('Start date') }}</v-list-tile-title>
            <v-list-tile-sub-title>
              <span v-show="project.startDate">{{ formatDate(project.startDate) }}</span>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile>
          <v-list-tile-avatar>
            <v-icon>alarm_on</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('End date') }}</v-list-tile-title>
            <v-list-tile-sub-title>
              <span v-show="project.endDate">{{ formatDate(project.endDate) }}</span>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
    </v-list>

    <v-subheader>Couleur</v-subheader>

    <v-list class="elevation-1">
      <v-list-tile>
        <v-list-tile-content>
          <div class="color" ref="color" :style="getColor(project)"></div>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-subheader>Catégories
    </v-subheader>
    <v-list class="elevation-1">
      <template v-for="group in assignedGroups" >
        <v-list-tile :key="group._id">
          <v-list-tile-avatar>
            <v-icon>folder</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{group.name}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>

    <v-subheader>Organisation</v-subheader>
    <v-list class="elevation-1" v-if="$subReady.organizations">
      <v-list-tile>
        <v-avatar>
          <v-icon>folder</v-icon>
        </v-avatar>
        <v-list-tile-content>
        <v-list-tile-title>{{ organization.name}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

  </div>
</template>

<script>
import { ProjectGroups } from '/imports/api/projectGroups/projectGroups.js'
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'

import DatesMixin from '/imports/ui/mixins/DatesMixin.js'
import MarkdownMixin from '/imports/ui/mixins/MarkdownMixin.js'


export default {
  name: 'project-info',
  mixins: [DatesMixin, MarkdownMixin],
  props: {
    project: Object
  },
  data () {
    return {
    }
  },
  meteor: {
    $subscribe: {
      'projectGroups': function() {
        return [];
      }
    },
  
    assignedGroups: {
      params () {
        return {
          project: this.project
        };
      },
      deep: false,
      update ({project}) {
        if (project) {
          return ProjectGroups.find({projects: project._id}, {sort: {name: 1}});
        }
      }
    },
  },
  methods: {
    getColor (project) {
      return 'background-color: ' + project.color;
    }
  }
}
</script>

<style scoped>

.groups {
  width: 100%;
}

.description, .estimatedSize {
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.color {
  height: 32px;
  width: 200px;
}
</style>