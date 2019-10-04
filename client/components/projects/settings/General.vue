<template>
  <div class="project-settings-general">
    <select-date @select="onSelectStartDate" :active.sync="showSelectStartDate" :disableTime="true"></select-date>
    <select-date @select="onSelectEndDate" :active.sync="showSelectEndDate" :disableTime="true"></select-date>
    <select-group @select="onSelectGroup" :active.sync="showSelectGroup" :organizationId="project.organizationId"></select-group>
    <select-feature @select="onSelectFeature" :active.sync="showSelectFeature" :project-id="project._id"></select-feature>
    <select-organization @select="onSelectOrganization" :active.sync="showSelectOrganization"></select-organization>
    <select-project @select="importLabels" :active.sync="showSelectProject"></select-project>
    <select-color @select="onSelectColor" :active.sync="showSelectColor"></select-color>

    <v-subheader>{{ $t("Description")}}</v-subheader>

    <div class="elevation-1 settings">
      <div class="description">
        <div v-show="!editDescription && project.description && project.description.length > 0" @click="startEditDescription">
          <div class="ql-editor-view" v-html="markDown(project.description)"></div>
        </div>
        <div v-show="!project.description && !editDescription" @click="startEditDescription">
          {{ $t("No description")}}
        </div>

        <div v-show="editDescription">
          <rich-editor ref="description" v-model="project.description" @submit="updateDescription"></rich-editor>
          <v-btn icon @click="updateDescription">
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="cancelUpdateDescription">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <v-subheader>{{ $t("Features") }}
        <v-btn text icon @click="showSelectFeature = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-subheader>
    <v-list class="elevation-1" v-if="projectFeatures.length > 0">
      <template v-for="feature in projectFeatures" >
        <v-list-item :key="feature._id">
          <v-list-item-avatar>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{feature}}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
          <v-btn text icon @click.stop="removeFeature(feature)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>    

    <v-subheader>{{ $t("State") }}</v-subheader>
    <div class="elevation-1 state">
      <v-select
        :items="projectStates()"
        item-text="label"
        item-value="value"
        v-model="project.state"
      ></v-select>
    </div>
    <v-subheader>{{ $t("Access rights") }}</v-subheader>
    <v-list class="elevation-1">
      <v-list-item @click="toggleProjectVisibility(project)">
        <v-list-item-avatar>
          <v-icon>{{getVisibilityIcon(project)}}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ getVisibilityText(project) }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch v-model="allowedOrganization" @click="toggleProjectVisibility(project)"></v-switch>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-subheader>{{ $t("Size")}}</v-subheader>
    <div class="elevation-1 settings" @click="startEditEstimatedSize">
      <div class="estimatedSize">
        <div v-show="!editEstimatedSize && project.estimatedSize && project.estimatedSize != 0">
          {{ project.estimatedSize }}
        </div>
        <div v-show="!project.estimatedSize && !editEstimatedSize">
          {{ $t('EstimationNone') }}
        </div>

        <div v-show="editEstimatedSize">
          <v-text-field v-focus v-model="project.estimatedSize" @keyup.enter="updateEstimatedSize" label="Estimation de la taille du projet"></v-text-field>
          <v-btn text icon @click.stop="updateEstimatedSize">
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>

          <v-btn text icon @click.stop="cancelUpdateEstimatedSize">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>

        </div>
      </div>
    </div>

    <v-subheader>{{ $t("Dates") }}</v-subheader>
    <v-list two-line class="elevation-1">
        <v-list-item @click="showSelectStartDate = true">
          <v-list-item-avatar>
            <v-icon>mdi-calendar-today</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ $t('Start date') }}</v-list-item-title>
            <v-list-item-subtitle>
              <span v-show="project.startDate">{{ formatDate(project.startDate) }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn text icon @click.stop="onSelectStartDate(null)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="showSelectEndDate = true">
          <v-list-item-avatar>
            <v-icon>mdi-alarm-check</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ $t('End date') }}</v-list-item-title>
            <v-list-item-subtitle>
              <span v-show="project.endDate">{{ formatDate(project.endDate) }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn text icon @click.stop="onSelectEndDate(null)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

    </v-list>

    
    <v-subheader>{{ $t("Color") }}</v-subheader>

    <v-list class="elevation-1">
      <v-list-item @click="showSelectColor = true">
        <v-list-item-content>
          <div class="color" ref="color" :style="getColor(project)"></div>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn text icon @click.stop="removeColor()">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-subheader>{{ $t("Categories") }}
        <v-btn text icon @click="showSelectGroup = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-subheader>
    <v-list class="elevation-1" v-if="assignedGroups.length > 0">
      <template v-for="group in assignedGroups" >
        <v-list-item :key="group._id">
          <v-list-item-avatar>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{group.name}}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
          <v-btn text icon @click.stop="removeGroup(group)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>

    <v-subheader>{{ $t("Labels") }}
        <v-btn text icon @click="showSelectProject = true">
          <v-icon>mdi-cloud-upload</v-icon>
        </v-btn>
    </v-subheader>
    <labels :project-id="project._id" mode="settings"></labels>

    <v-subheader>{{ $t("Organization") }}</v-subheader>
    <v-list class="elevation-1" v-if="$subReady.organizations">
      <v-list-item @click="showSelectOrganization = true">
        <v-avatar>
          <v-icon>mdi-folder</v-icon>
        </v-avatar>
        <v-list-item-content>
        <v-list-item-title><template v-if="organization">{{ organization.name}}</template></v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

  </div>
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { Projects } from "/imports/api/projects/projects.js";
import { ProjectStates, ProjectAccessRights } from "/imports/api/projects/projects.js";
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
  watch: {
    'project.state'(state) {
      Meteor.call("projects.updateState", {projectId: this.project._id, state: state});
    }
  },
  computed: {
    projectFeatures() {
      return (this.project && this.project.features) || [];
    },
    allowedOrganization: {
      get() {
        return this.project && this.project.accessRights === ProjectAccessRights.ORGANIZATION
      },
      set(value) {
        if (value) { 
          this.project.accessRights = ProjectAccessRights.ORGANIZATION;
        } else {
          this.project.accessRights = ProjectAccessRights.PRIVATE;
        }
      }
    }
  },
  data() {
    return {
      showSelectStartDate: false,
      showSelectEndDate: false,
      showSelectGroup: false,
      showSelectOrganization: false,
      showSelectProject: false,
      showSelectColor: false,
      showSelectFeature: false,
      editDescription: false,
      editEstimatedSize: false,
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
  methods: {
    onSelectStartDate(date) {
      Meteor.call("projects.setStartDate", {projectId: this.project._id, startDate: date});
    },

    onSelectEndDate(date) {
      Meteor.call("projects.setEndDate", {projectId: this.project._id, endDate: date});
    },

    removeGroup(group) {
      Meteor.call("projectGroups.removeProject", group._id, this.project._id);
    },

    onSelectGroup(group) {
      Meteor.call("projectGroups.addProject", group._id, this.project._id);
    },

    onSelectFeature(feature) {
      Meteor.call("projects.addFeature", {projectId: this.project._id, feature: feature}, (error, result) => {
        this.project.features = result.features;
      });
    },

    removeFeature(feature) {
      Meteor.call("projects.removeFeature", {projectId: this.project._id, feature: feature}, (error, result) => {
        this.project.features = result.features;
      });
    },

    onSelectOrganization(organization) {
      let organizationId;
      if (organization) {
        organizationId = organization._id
      }

      if (organizationId && organizationId === this.project.organizationId) {
        // same organization ? Do not move
        return;
      }

      Meteor.call(
        "organizations.moveProject", {
          organizationId: organizationId,
          projectId: this.project._id,
        },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$router.push({
            name: "project-settings",
            params: {
              projectId: this.project._id
            }
          });
        }
      );
    },

    importLabels(project) {
      Meteor.call("labels.import", {from: project._id, to: this.project._id});
    },

    startEditDescription() {
      this.savedDescription = this.project.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.focus());
    },

    updateDescription() {
      this.editDescription = false;
      Meteor.call(
        "projects.updateDescription", {
          projectId: this.project._id,
          description: this.project.description
        }, (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            this.cancelUpdateDescription();
            return;
          }
        }
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
      Meteor.call("projects.updateColor", {projectId: this.project._id, color: hex});
    },

    removeColor() {
      this.project.color = "";
      Meteor.call("projects.updateColor", {projectId: this.project._id, color: ""});
    },

    getColor(project) {
      return "background-color: " + project.color;
    },

    getVisibilityIcon(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },

    getVisibilityText(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return this.$t("Organization");
      }
      return this.$t("The project is private");
    },

    toggleProjectVisibility(project) {
      if (project.accessRights === "private") {
        project.accessRights = "organization";
      } else {
        project.accessRights = "private";
      }
      Meteor.call("projects.updateAccessRights", {projectId: project._id, accessRights: project.accessRights});
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        this.$store.dispatch("notify", this.$t("Organization"));
      } else {
        this.$store.dispatch("notify", this.$t("The project is private"));
      }
    },

    projectStates () {
      const states = []
      Object.keys(ProjectStates).map(state => {
        states.push({
          value: ProjectStates[state],
          label: this.$t(`projects.state.${state}`)
        })
      });
      return states;
    }
  }
};
</script>

<style scoped>
.project-settings-general {
  margin-bottom: 24px;
}

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

.state {
  padding-left: 24px;
  background-color: white;
}

</style>