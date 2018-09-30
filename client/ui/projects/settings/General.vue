<template>
  <div class="project-settings-general"> 
    <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate" :disableTime="true"></select-date>
    <select-date @select="onSelectEndDate" :active.sync="showSelectEndDate"  :disableTime="true"></select-date>
    <select-group @select="onSelectGroup" :active.sync="showSelectGroup" :organizationId="project.organizationId"></select-group>
    <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color> 

    <md-subheader>Description</md-subheader>
    <div class="md-elevation-1">
      <div class="description">
        <div v-show="!editDescription && project.description && project.description.length > 0" @click="startEditDescription">
          <div v-html="markDown(project.description)"></div>
        </div>
        <div v-show="!project.description && !editDescription" @click="startEditDescription">
          Aucune description
        </div>

        <div v-show="editDescription">
          <md-field>
            <label>Description</label>
            <md-textarea ref="description" v-model="project.description" @keyup.ctrl.enter="updateDescription"></md-textarea>
          </md-field>
          <md-button class="md-icon-button" @click.native="updateDescription">
            <md-icon>check_circle</md-icon>
          </md-button>

          <md-button class="md-icon-button" @click.native="cancelUpdateDescription">
            <md-icon>cancel</md-icon>
          </md-button>

        </div>
      </div>
    </div>

    <md-list>
      <md-subheader>Visibilité</md-subheader>
      <div class="md-elevation-1">
        <md-list-item @click="toggleProjectVisibility(project)">
          <md-avatar class="md-avatar-icon">
            <md-icon>{{getVisibilityIcon(project)}}</md-icon>
          </md-avatar>
          <div class="md-list-item-text">
            {{ getVisibilityText(project) }}
          </div>
          <md-switch class="md-list-action" v-model="project.isPublic"></md-switch>
        </md-list-item>
      </div>
    </md-list>

    <md-subheader>Taille</md-subheader>
    <div class="md-elevation-1" @click="startEditEstimatedSize">
      <div class="estimatedSize">
        <div v-show="!editEstimatedSize && project.estimatedSize && project.estimatedSize != 0">
          {{ project.estimatedSize }}
        </div>
        <div v-show="!project.estimatedSize && !editEstimatedSize">
          Aucune estimation
        </div>

        <div v-show="editEstimatedSize">
          <md-field>
            <label>Estimation de la taille du projet</label>
            <md-input type="number" ref="estimatedSize" v-model="project.estimatedSize" @keyup.enter="updateEstimatedSize"></md-input>
          </md-field>
          <md-button class="md-icon-button" @click.stop="updateEstimatedSize">
            <md-icon>check_circle</md-icon>
          </md-button>

          <md-button class="md-icon-button" @click.stop="cancelUpdateEstimatedSize">
            <md-icon>cancel</md-icon>
          </md-button>

        </div>
      </div>
    </div>

    <md-list class="md-double-line">
      <md-subheader>Dates</md-subheader>
      <div class="md-elevation-1">
        <md-list-item @click="showSelectStartDate = true">
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
          <md-button class="md-icon-button md-list-action" @click.stop="onSelectStartDate(null)">
            <md-icon>delete</md-icon>
            <md-tooltip md-delay="300">Supprimer</md-tooltip>
          </md-button>
        </md-list-item>

        <md-divider></md-divider>

        <md-list-item @click="showSelectEndDate = true">
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
          <md-button class="md-icon-button md-list-action" @click.stop="onSelectEndDate(null)">
            <md-icon>delete</md-icon>
            <md-tooltip md-delay="300">Supprimer</md-tooltip>
          </md-button>
        </md-list-item>
      </div>

      <md-subheader>Couleur
      </md-subheader>

      <div class="md-elevation-1" >
        <md-list-item @click="showSelectColor = true">
          <div class="md-list-item-text">
            <div class="color" ref="color" :style="getColor(project)"></div>
          </div>
          <md-button class="md-icon-button md-list-action"  @click.stop="removeColor()">
            <md-icon>delete</md-icon>
            <md-tooltip md-delay="300">Supprimer</md-tooltip>
          </md-button>
        </md-list-item>
        <md-divider></md-divider> 
      </div>



      <md-subheader>Catégories

        <md-button class="md-icon-button" @click="showSelectGroup = true">
        <md-icon>add</md-icon>
        <md-tooltip md-delay="300">Ajouter une catégorie</md-tooltip>
        </md-button>
 
      </md-subheader>
      <div class="md-elevation-1">
        <div v-for="group in assignedGroups" :key="group._id">
          <md-list-item>
            <md-avatar class="md-avatar-icon">
              <md-icon>folder</md-icon>
            </md-avatar>
            <div class="md-list-item-text">
              {{group.name}}
            </div>
            <md-button class="md-icon-button md-list-action" @click.stop="removeGroup(group)">
              <md-icon>delete</md-icon>
              <md-tooltip md-delay="300">Retirer</md-tooltip>
            </md-button>
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
  name: 'project-settings-general',
  mixins: [DatesMixin, MarkdownMixin],
  props: {
    project: Object
  },
  data () {
    return {
      showSelectStartDate: false,
      showSelectEndDate: false,
      showSelectGroup: false,
      showSelectColor: false,
      editDescription: false,
      editEstimatedSize: false
    }
  },
  meteor: {
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
    onSelectStartDate (date) {
      Meteor.call('projects.setStartDate', this.project._id, date);
    },

    onSelectEndDate (date) {
      Meteor.call('projects.setEndDate', this.project._id, date);
    },

    removeGroup (group) {
      Meteor.call('projectGroups.removeProject', group._id, this.project._id);
    },

    onSelectGroup (group) {
      Meteor.call('projectGroups.addProject', group._id, this.project._id);
    },

    startEditDescription () {
      this.savedDescription = this.project.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.$el.focus());
    },

    updateDescription () {
      this.editDescription = false;
      Meteor.call('projects.updateDescription', this.project._id, this.project.description);
    },

    cancelUpdateDescription () {
      this.editDescription = false;
      this.project.description = this.savedDescription;
    },

    startEditEstimatedSize () {
      this.savedEstimatedSize = this.project.estimatedSize;
      this.editEstimatedSize = true;
      this.$nextTick(() => this.$refs.estimatedSize.$el.focus());
    },

    updateEstimatedSize () {
      this.editEstimatedSize = false;
      Meteor.call('projects.updateEstimatedSize', this.project._id, parseFloat(this.project.estimatedSize));
    },

    cancelUpdateEstimatedSize () {
      this.editEstimatedSize = false;
      this.project.estimatedSize = this.savedEstimatedSize;
    },

    onSelectColor (color) {
      var hex = color.hex || 'white';
      this.$refs.color.style.backgroundColor = hex;
      this.project.color = hex;
      Meteor.call('projects.updateColor', this.project._id, hex);
    },

    removeColor () {
      this.project.color = '';
      Meteor.call('projects.updateColor', this.project._id, '');
    },

    getColor (project) {
      return 'background-color: ' + project.color;
    },

    getVisibilityIcon (project) {
      if (project.isPublic) {
        return 'visibility';
      }
      return 'visibility_off';
    },

    getVisibilityText (project) {
      if (project.isPublic) {
        return 'Tout le monde voit ce projet';
      }
      return 'Limitée aux membres du projet';
    },

    toggleProjectVisibility (project) {
      project.isPublic = !project.isPublic;
      Meteor.call('projects.updateIsPublic', project._id, project.isPublic);
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