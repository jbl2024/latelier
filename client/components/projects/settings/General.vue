<template>
  <div class="project-settings-general">
    <select-date
      :active.sync="showSelectStartDate"
      :disable-time="true"
      @select="onSelectStartDate"
    />
    <select-date
      :active.sync="showSelectEndDate"
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
      :project-id="project._id"
      @select="onSelectFeature"
    />
    <select-organization
      :active.sync="showSelectOrganization"
      @select="onSelectOrganization"
    />
    <select-project :active.sync="showSelectProject" @select="importLabels" />
    <select-color :active.sync="showSelectColor" @select="onSelectColor" />

    <v-subheader>{{ $t("Description") }}</v-subheader>

    <div class="elevation-1 settings">
      <div class="description">
        <div
          v-show="
            !editDescription &&
              project.description &&
              project.description.length > 0
          "
          @click="startEditDescription"
        >
          <div class="ql-editor-view" v-html="markDown(project.description)" />
        </div>
        <div
          v-show="!project.description && !editDescription"
          @click="startEditDescription"
        >
          {{ $t("No description") }}
        </div>

        <div v-show="editDescription">
          <rich-editor
            ref="description"
            v-model="project.description"
            @submit="updateDescription"
          />
          <v-btn icon @click="updateDescription">
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="cancelUpdateDescription">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <v-subheader>
      {{ $t("Features") }}
      <v-btn text icon @click="showSelectFeature = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-subheader>
    <v-list v-if="projectFeatures.length > 0" class="elevation-1">
      <template v-for="feature in projectFeatures">
        <v-list-item :key="feature._id">
          <v-list-item-avatar>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ feature }}</v-list-item-title>
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
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import {
  ProjectStates,
  ProjectAccessRights
} from "/imports/api/projects/projects.js";

import { Organizations } from "/imports/api/organizations/organizations.js";

import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

export default {
  name: "ProjectSettingsGeneral",
  mixins: [DatesMixin, MarkdownMixin],
  props: {
    project: {
      type: Object,
      default: () => {}
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
      editDescription: false
    };
  },
  computed: {
    projectFeatures() {
      return (this.project && this.project.features) || [];
    },
    allowedOrganization: {
      get() {
        return (
          this.project
          && this.project.accessRights === ProjectAccessRights.ORGANIZATION
        );
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
      Meteor.call("labels.import", { from: project._id, to: this.project._id });
    },

    startEditDescription() {
      this.savedDescription = this.project.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.focus());
    },

    updateDescription() {
      this.editDescription = false;
      Meteor.call(
        "projects.updateDescription",
        {
          projectId: this.project._id,
          description: this.project.description
        },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            this.cancelUpdateDescription();
          }
        }
      );
    },

    cancelUpdateDescription() {
      this.editDescription = false;
      this.project.description = this.savedDescription;
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
      Meteor.call("projects.updateAccessRights", {
        projectId: project._id,
        accessRights: project.accessRights
      });
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        this.$store.dispatch("notify", this.$t("Organization"));
      } else {
        this.$store.dispatch("notify", this.$t("The project is private"));
      }
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

<style scoped>
.project-settings-general {
  margin-bottom: 24px;
}

.groups {
  width: 100%;
}

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
