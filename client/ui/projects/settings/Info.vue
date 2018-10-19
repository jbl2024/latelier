<template>
  <div class="project-info"> 
    <md-subheader>Description</md-subheader>
    <div class="elevation-1">
        <div class="description">
          <div v-show="project.description && project.description.length > 0">
            <div v-html="markDown(project.description)"></div>
          </div>
          <div v-show="!project.description">
            Aucune description
          </div>
        </div>
    </div>

    <md-list class="md-double-line">
      <md-subheader>Dates</md-subheader>
      <div class="elevation-1">
        <md-list-item>
          <md-avatar class="md-avatar-icon">
            <md-icon>calendar_today</md-icon>
          </md-avatar>
          <div class="md-list-item-text">
            <span>Date de début</span>
            <span>
              <span v-show="project.startDate">{{ formatDate(project.startDate) }}</span>
              <span v-show="!project.startDate">Aucune</span>
            </span>
          </div>
        </md-list-item>

        <md-divider></md-divider>

        <md-list-item>
          <md-avatar class="md-avatar-icon">
            <md-icon>alarm_on</md-icon>
          </md-avatar>
          <div class="md-list-item-text">
            <span>Date de fin</span>
            <span>
              <span v-show="project.endDate">{{ formatDate(project.endDate) }}</span>
              <span v-show="!project.endDate">Aucune</span>
            </span>
          </div>
        </md-list-item>
      </div>

      <md-subheader>Couleur
      </md-subheader>

      <div class="elevation-1" >
        <md-list-item>
          <div class="md-list-item-text">
            <div class="color" ref="color" :style="getColor(project)"></div>
          </div>
        </md-list-item>
        <md-divider></md-divider> 
      </div>

      <md-subheader>Catégories
 
      </md-subheader>
      <div class="elevation-1">
        <div v-for="group in assignedGroups" :key="group._id">
          <md-list-item>
            <md-avatar class="md-avatar-icon">
              <md-icon>folder</md-icon>
            </md-avatar>
            <div class="md-list-item-text">
              {{group.name}}
            </div>
          </md-list-item>
          <md-divider></md-divider> 
        </div>
      </div>

    </md-list>    
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