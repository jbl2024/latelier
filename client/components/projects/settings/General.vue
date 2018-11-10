<template>
  <div class="project-settings-general">
    <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate" :disableTime="true"></select-date>
    <select-date @select="onSelectEndDate" :active.sync="showSelectEndDate" :disableTime="true"></select-date>
    <select-group @select="onSelectGroup" :active.sync="showSelectGroup" :organizationId="project.organizationId"></select-group>
    <select-organization @select="onSelectOrganization" :active.sync="showSelectOrganization"></select-organization>
    <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color>

    <v-subheader>Description</v-subheader>

    <div class="elevation-1 settings">
      <div class="description">
        <div v-show="!editDescription && project.description && project.description.length > 0" @click="startEditDescription">
          <div v-html="markDown(project.description)"></div>
        </div>
        <div v-show="!project.description && !editDescription" @click="startEditDescription">
          Aucune description
        </div>

        <div v-show="editDescription">
          <v-textarea ref="description" solo label=Description v-model="project.description" @keyup.ctrl.enter="updateDescription"></v-textarea>
          <v-btn icon @click="updateDescription">
            <v-icon>check_circle</v-icon>
          </v-btn>
          <v-btn icon @click="cancelUpdateDescription">
            <v-icon>cancel</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <v-subheader>Visibilité</v-subheader>
    <v-list class="elevation-1">
      <v-list-tile @click="toggleProjectVisibility(project)">
        <v-list-tile-avatar>
          <v-icon>{{getVisibilityIcon(project)}}</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ getVisibilityText(project) }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch v-model="project.isPublic" @click="toggleProjectVisibility(project)"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-subheader>Taille</v-subheader>
    <div class="elevation-1 settings" @click="startEditEstimatedSize">
      <div class="estimatedSize">
        <div v-show="!editEstimatedSize && project.estimatedSize && project.estimatedSize != 0">
          {{ project.estimatedSize }}
        </div>
        <div v-show="!project.estimatedSize && !editEstimatedSize">
          Aucune estimation
        </div>

        <div v-show="editEstimatedSize">
          <v-text-field v-focus v-model="project.estimatedSize" @keyup.enter="updateEstimatedSize" label="Estimation de la taille du projet"></v-text-field>
          <v-btn flat icon @click.stop="updateEstimatedSize">
            <v-icon>check_circle</v-icon>
          </v-btn>

          <v-btn flat icon @click.stop="cancelUpdateEstimatedSize">
            <v-icon>cancel</v-icon>
          </v-btn>

        </div>
      </div>
    </div>

    <v-subheader>Dates</v-subheader>
    <v-list two-line class="elevation-1">
        <v-list-tile @click="showSelectStartDate = true">
          <v-list-tile-avatar>
            <v-icon>calendar_today</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>Date de début</v-list-tile-title>
            <v-list-tile-sub-title>
              <span v-show="project.startDate">{{ formatDate(project.startDate) }}</span>
              <span v-show="!project.startDate">Aucune</span>
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn flat icon @click.stop="onSelectStartDate(null)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile @click="showSelectEndDate = true">
          <v-list-tile-avatar>
            <v-icon>alarm_on</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>Date de fin</v-list-tile-title>
            <v-list-tile-sub-title>
              <span v-show="project.endDate">{{ formatDate(project.endDate) }}</span>
              <span v-show="!project.endDate">Aucune</span>
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn flat icon @click.stop="onSelectEndDate(null)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

    </v-list>

    
    <v-subheader>Couleur</v-subheader>

    <v-list class="elevation-1">
      <v-list-tile @click="showSelectColor = true">
        <v-list-tile-content>
          <div class="color" ref="color" :style="getColor(project)"></div>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn flat icon @click.stop="removeColor()">
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-subheader>Catégories
        <v-btn flat icon @click="showSelectGroup = true">
          <v-icon>add</v-icon>
        </v-btn>
    </v-subheader>
    <v-list class="elevation-1" v-if="assignedGroups.length > 0">
      <template v-for="group in assignedGroups" >
        <v-list-tile :key="group._id">
          <v-list-tile-avatar>
            <v-icon>folder</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{group.name}}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
          <v-btn flat icon @click.stop="removeGroup(group)">
            <v-icon>delete</v-icon>
          </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </template>
    </v-list>

    <v-subheader>Organisation</v-subheader>
    <v-list class="elevation-1" v-if="$subReady.organizations">
      <v-list-tile @click="showSelectOrganization = true">
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
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Projects } from "/imports/api/projects/projects.js";
import { Organizations } from "/imports/api/organizations/organizations.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

export default {
  name: "project-settings-general",
  mixins: [DatesMixin, MarkdownMixin],
  props: {
    project: Object
  },
  data() {
    return {
      showSelectStartDate: false,
      showSelectEndDate: false,
      showSelectGroup: false,
      showSelectOrganization: false,
      showSelectColor: false,
      editDescription: false,
      editEstimatedSize: false
    };
  },
  meteor: {
    $subscribe: {
      organizations: function() {
        return [];
      }
    },
    assignedGroups: {
      params() {
        return {
          project: this.project
        };
      },
      deep: false,
      update({ project }) {
        if (project) {
          return ProjectGroups.find(
            { projects: project._id },
            { sort: { name: 1 } }
          );
        }
      }
    },

    organization: {
      params() {
        return {
          project: this.project
        };
      },
      deep: false,
      update({ project }) {
        if (project) {
          return Organizations.findOne(
            { _id: project.organizationId },
            { sort: { name: 1 } }
          );
        }
      }
    }
  },
  i18n: {
    messages: {
      en: { 
        projectIsPublic: "The project is public",
        projectIsPrivate: "The project is private"
      },
      fr: {
        projectIsPublic: "Le projet est public",
        projectIsPrivate: "Le projet est privé"
      }
    }
  },  
  methods: {
    onSelectStartDate(date) {
      Meteor.call("projects.setStartDate", this.project._id, date);
    },

    onSelectEndDate(date) {
      Meteor.call("projects.setEndDate", this.project._id, date);
    },

    removeGroup(group) {
      Meteor.call("projectGroups.removeProject", group._id, this.project._id);
    },

    onSelectGroup(group) {
      Meteor.call("projectGroups.addProject", group._id, this.project._id);
    },

    onSelectOrganization(organization) {
      if (organization._id === this.project.organizationId) {
        return;
      }

      Meteor.call(
        "organizations.moveProject",
        organization._id,
        this.project._id,
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }
          this.$router.push({
            name: "project-settings",
            params: {
              organizationId: organization._id,
              projectId: this.project._id
            }
          });
        }
      );
    },

    startEditDescription() {
      this.savedDescription = this.project.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.$el.focus());
    },

    updateDescription() {
      this.editDescription = false;
      Meteor.call(
        "projects.updateDescription",
        this.project._id,
        this.project.description
      );
    },

    cancelUpdateDescription() {
      this.editDescription = false;
      this.project.description = this.savedDescription;
    },

    startEditEstimatedSize() {
      this.savedEstimatedSize = this.project.estimatedSize;
      this.editEstimatedSize = true;
      this.$nextTick(() => this.$refs.estimatedSize.$el.focus());
    },

    updateEstimatedSize() {
      this.editEstimatedSize = false;
      Meteor.call(
        "projects.updateEstimatedSize",
        this.project._id,
        parseFloat(this.project.estimatedSize)
      );
    },

    cancelUpdateEstimatedSize() {
      this.editEstimatedSize = false;
      this.project.estimatedSize = this.savedEstimatedSize;
    },

    onSelectColor(color) {
      var hex = color.hex || "white";
      this.$refs.color.style.backgroundColor = hex;
      this.project.color = hex;
      Meteor.call("projects.updateColor", this.project._id, hex);
    },

    removeColor() {
      this.project.color = "";
      Meteor.call("projects.updateColor", this.project._id, "");
    },

    getColor(project) {
      return "background-color: " + project.color;
    },

    getVisibilityIcon(project) {
      if (project.isPublic) {
        return "visibility";
      }
      return "visibility_off";
    },

    getVisibilityText(project) {
      if (project.isPublic) {
        return "Tout le monde voit ce projet";
      }
      return "Limitée aux membres du projet";
    },

    toggleProjectVisibility(project) {
      project.isPublic = !project.isPublic;
      Meteor.call("projects.updateIsPublic", project._id, project.isPublic);
      if (!project.isPublic) {
        this.$store.dispatch("notify", this.$t("projectIsPublic"));
      } else {
        this.$store.dispatch("notify", this.$t("projectIsPrivate"));
      }
    }
  }
};
</script>

<style scoped>
.groups {
  width: 100%;
}

.description,
.estimatedSize {
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.color {
  height: 32px;
  width: 100%;
}

.settings {
  background-color: white;
}
</style>