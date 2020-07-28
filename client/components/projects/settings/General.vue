<template>
  <div v-if="project" class="project-settings-general">
    <select-date
      v-model="showSelectStartDate"
      :disable-time="true"
      @select="onSelectStartDate"
    />
    <select-date
      v-model="showSelectEndDate"
      :disable-time="true"
      @select="onSelectEndDate"
    />
    <select-group
      :active.sync="showSelectGroup"
      :organization-id="project.organizationId"
      @select="onSelectGroup"
    />
    <select-feature
      :active.sync="showSelectFeature"
      :features="features"
      @select="onSelectFeature"
    />
    <select-organization
      :active.sync="showSelectOrganization"
      @select="onSelectOrganization"
    />
    <select-project v-model="showSelectProject" @select="importLabels" />
    <select-color :active.sync="showSelectColor" @select="onSelectColor" />
    <div class="wrapper">
      <v-subheader>{{ $t("Name") }}</v-subheader>
      <div class="elevation-1 settings">
        <div class="name headline">
          <editable-text
            v-model="project.name"
            type="text-field"
            :is-edited.sync="editName"
            @update="updateProjectName"
            @cancel="cancelUpdateProjectName"
          />
        </div>
      </div>

      <v-subheader>{{ $t("Color") }}</v-subheader>

      <v-list class="elevation-1">
        <v-list-item @click="showSelectColor = true">
          <v-list-item-content>
            <div ref="color" class="color" :style="getColor(project)" />
          </v-list-item-content>
          <v-list-item-action>
            <v-btn text icon @click.stop="removeColor()">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-subheader>{{ $t("Description") }}</v-subheader>
      <div class="elevation-1 settings">
        <div class="description">
          <editable-text
            v-model="project.description"
            :is-edited.sync="editDescription"
            :empty-text="$t('No description')"
            :options="{ markdown: true }"
            @update="updateDescription"
            @cancel="cancelUpdateDescription"
          />
        </div>
      </div>

      <v-subheader>
        {{ $t("Features") }}
        <v-btn text icon @click="showSelectFeature = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-subheader>
      <v-list v-if="projectFeatures.length > 0" class="elevation-1">
        <v-list-item v-for="feature in projectFeatures" :key="feature.name">
          <v-list-item-avatar v-if="feature.icon">
            <v-icon>
              {{ feature.icon }}
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ feature.text }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn text icon @click.stop="removeFeature(feature.name)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-subheader>{{ $t("State") }}</v-subheader>
      <div class="elevation-1 state">
        <v-select
          v-model="project.state"
          :items="projectStates()"
          item-text="label"
          item-value="value"
        />
      </div>
      <v-subheader>{{ $t("Access rights") }}</v-subheader>
      <v-list class="elevation-1">
        <v-list-item @click="toggleProjectVisibility(project)">
          <v-list-item-avatar>
            <v-icon>{{ getVisibilityIcon(project) }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ getVisibilityText(project) }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-switch
              v-model="allowedOrganization"
              color="accent"
              @click="toggleProjectVisibility(project)"
            />
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-subheader>{{ $t("Dates") }}</v-subheader>
      <v-list two-line class="elevation-1">
        <v-list-item @click="showSelectStartDate = true">
          <v-list-item-avatar>
            <v-icon>mdi-calendar-today</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ $t("Start date") }}</v-list-item-title>
            <v-list-item-subtitle>
              <span v-show="project.startDate">{{
                formatDate(project.startDate)
              }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn text icon @click.stop="onSelectStartDate(null)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-divider />

        <v-list-item @click="showSelectEndDate = true">
          <v-list-item-avatar>
            <v-icon>mdi-alarm-check</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ $t("End date") }}</v-list-item-title>
            <v-list-item-subtitle>
              <span v-show="project.endDate">{{
                formatDate(project.endDate)
              }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn text icon @click.stop="onSelectEndDate(null)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-subheader>
        {{ $t("Categories") }}
        <v-btn text icon @click="showSelectGroup = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-subheader>
      <v-list v-if="assignedGroups.length > 0" class="elevation-1">
        <template v-for="group in assignedGroups">
          <v-list-item :key="group._id">
            <v-list-item-avatar>
              <v-icon>mdi-folder</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ group.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn text icon @click.stop="removeGroup(group)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>

      <v-subheader>
        {{ $t("Labels") }}
        <v-btn text icon @click="showSelectProject = true">
          <v-icon>mdi-cloud-upload</v-icon>
        </v-btn>
      </v-subheader>
      <labels :project-id="project._id" mode="settings" />

      <v-subheader>{{ $t("Organization") }}</v-subheader>
      <v-list v-if="$subReady.organizations" class="elevation-1">
        <v-list-item @click="showSelectOrganization = true">
          <v-avatar>
            <v-icon>mdi-folder</v-icon>
          </v-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <template v-if="organization">
                {{ organization.name }}
              </template>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

    </div>
  </div>
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import {
  ProjectStates,
  ProjectAccessRights
} from "/imports/api/projects/projects.js";

import { Organizations } from "/imports/api/organizations/organizations.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import EditableText from "/imports/ui/widgets/EditableText";

export default {
  name: "ProjectSettingsGeneral",
  components: {
    EditableText
  },
  mixins: [DatesMixin],
  props: {
    project: {
      type: Object,
      default: null
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
      editName: false,
      editDescription: false,
      features: Object.freeze([
        { name: "estimation", text: this.$t("projects.features.features.estimation"), icon: "mdi-timelapse" },
        { name: "meetings", text: this.$t("projects.features.features.meetings"), icon: "mdi-calendar-star" }
      ])
    };
  },
  computed: {
    projectFeatures() {
      const projectFeatures = Array.isArray(this.project?.features) ? this.project.features : [];
      return projectFeatures.map((feature) => this.features.find((feat) => feat.name === feature));
    },
    allowedOrganization: {
      get() {
        return (
          this.project
          && this.project.accessRights === ProjectAccessRights.ORGANIZATION
        );
      },
      set(value) {
        const accessRights = value
          ? ProjectAccessRights.ORGANIZATION
          : ProjectAccessRights.PRIVATE;
        this.project.accessRights = accessRights;
      }
    }
  },
  watch: {
    "project.state"(state) {
      Meteor.call("projects.updateState", {
        projectId: this.project._id,
        state
      });
    }
  },
  meteor: {
    $subscribe: {
      organizations() {
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
        return null;
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
        return null;
      }
    }
  },
  methods: {
    onSelectStartDate(date) {
      Meteor.call("projects.setStartDate", {
        projectId: this.project._id,
        startDate: date
      });
    },

    onSelectEndDate(date) {
      Meteor.call("projects.setEndDate", {
        projectId: this.project._id,
        endDate: date
      });
    },

    removeGroup(group) {
      Meteor.call("projectGroups.removeProject", group._id, this.project._id);
    },

    onSelectGroup(group) {
      Meteor.call("projectGroups.addProject", group._id, this.project._id);
    },

    onSelectFeature(feature) {
      Meteor.call(
        "projects.addFeature",
        { projectId: this.project._id, feature },
        (error, result) => {
          this.project.features = result.features;
        }
      );
    },
    removeFeature(feature) {
      Meteor.call(
        "projects.removeFeature",
        { projectId: this.project._id, feature },
        (error, result) => {
          this.project.features = result.features;
        }
      );
    },

    onSelectOrganization(organization) {
      let organizationId;
      if (organization) {
        organizationId = organization._id;
      }

      if (organizationId && organizationId === this.project.organizationId) {
        // same organization ? Do not move
        return;
      }

      Meteor.call(
        "organizations.moveProject",
        {
          organizationId,
          projectId: this.project._id
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
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
      Meteor.call("labels.import", { from: project._id, to: this.project._id });
    },
    updateProjectName(name, savedName) {
      this.editName = false;
      Meteor.call(
        "projects.updateName",
        {
          projectId: this.project._id,
          name: this.project.name
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
            this.cancelUpdateProjectName(savedName);
          }
        }
      );
    },
    cancelUpdateProjectName(savedProjectName) {
      this.editName = false;
      this.project.name = savedProjectName;
    },
    updateDescription(description, savedDescription) {
      this.editDescription = false;
      Meteor.call(
        "projects.updateDescription",
        {
          projectId: this.project._id,
          description: this.project.description
        },
        (error) => {
          if (error) {
            this.$notifyError(error);
            this.cancelUpdateDescription(savedDescription);
          }
        }
      );
    },
    cancelUpdateDescription(savedDescription) {
      this.editDescription = false;
      this.project.description = savedDescription;
    },

    onSelectColor(color) {
      const hex = color || "white";
      this.$refs.color.style.backgroundColor = hex;
      this.project.color = hex;
      Meteor.call("projects.updateColor", {
        projectId: this.project._id,
        color: hex
      });
    },

    removeColor() {
      this.project.color = "";
      Meteor.call("projects.updateColor", {
        projectId: this.project._id,
        color: ""
      });
    },
    getColor(project) {
      return `background-color: ${project.color}`;
    },
    getVisibilityIcon(project) {
      return project.accessRights === ProjectAccessRights.ORGANIZATION
        ? "mdi-eye"
        : "mdi-eye-off";
    },
    getVisibilityText(project) {
      return this.$t(
        project.accessRights === ProjectAccessRights.ORGANIZATION
          ? "Organization"
          : "The project is private"
      );
    },
    toggleProjectVisibility(project) {
      project.accessRights = project.accessRights === "private" ? "organization" : "private";
      Meteor.call("projects.updateAccessRights", {
        projectId: project._id,
        accessRights: project.accessRights
      });
      this.$notify(this.getVisibilityText(project));
    },
    projectStates() {
      const states = [];
      Object.keys(ProjectStates).forEach((state) => {
        states.push({
          value: ProjectStates[state],
          label: this.$t(`projects.state.${state}`)
        });
      });
      return states;
    }
  }
};
</script>

<style lang="scss" scoped>
.project-settings-general {
  background-color: #e5e5e5;
}

.wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 24px;
  margin-top: 24px;
  margin-bottom: 24px;
  background-color: white;
  border-radius: 4px;
}

.groups {
  width: 100%;
}

.name,
.description {
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
