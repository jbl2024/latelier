<template>
  <div class="new-project">
    <select-feature
      :active.sync="showSelectFeature"
      :features="features"
      @select="onSelectFeature"
    />
    <generic-dialog
      v-model="showDialog"
      max-width="820"
      :title="$t('New project')"
    >
      <template v-slot:content>
        <v-stepper v-model="stepper" non-linear vertical class="stepper">
          <v-stepper-step :complete="isStep1Completed()" step="1" editable>
            {{ $t('Name') }}
            <div v-if="name && stepper != 1" class="subtitle-2 grey--text">
              {{ name }}
            </div>
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-text-field
              v-model="name"
              autofocus
              :label="$t('Name')"
            />
            <v-btn :disabled="!isStep1Completed()" color="primary" @click="stepper = 2">
              {{ $t('Next') }}
            </v-btn>
          </v-stepper-content>

          <v-stepper-step step="2" editable>
            {{ $t('Features') }}
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-subheader>
              {{ $t("Features") }}
              <v-btn text icon @click="showSelectFeature = true">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-subheader>
            <v-list v-if="projectFeatures.length > 0" class="elevation-1">
              <v-list-item
                v-for="feature in projectFeatures"
                :key="feature.name"
              >
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
                  <v-btn
                    text
                    icon
                    @click.stop="removeFeature(feature.name)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div class="mt-2">
              <v-btn v-if="organizationId" color="primary" @click="stepper = 3">
                {{ $t('Next') }}
              </v-btn>
              <v-btn text @click="stepper = 1">
                {{ $t('Previous') }}
              </v-btn>
            </div>
          </v-stepper-content>

          <v-stepper-step v-if="organizationId" step="3" editable>
            {{ $t('Access rights') }}
          </v-stepper-step>

          <v-stepper-content v-if="organizationId" step="3">
            <v-list class="elevation-1">
              <v-list-item @click="allowOrganization = !allowOrganization">
                <v-list-item-avatar>
                  <v-icon>
                    {{ getVisibilityIcon(allowOrganization) }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ getVisibilityText(allowOrganization) }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch
                    v-model="allowOrganization"
                    color="accent"
                    @click="allowOrganization = !allowOrganization"
                  />
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div class="mt-2">
              <v-btn text @click="stepper = 2">
                {{ $t('Previous') }}
              </v-btn>
            </div>
          </v-stepper-content>
        </v-stepper>
      </template>

      <template v-slot:actions>
        <v-btn text :disabled="!isStep1Completed()" @click="create">
          {{ $t("Create") }}
        </v-btn>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import {
  ProjectStates,
  ProjectAccessRights
} from "/imports/api/projects/projects.js";

export default {
  props: {
    organizationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      stepper: 1,
      showDialog: false,
      showSelectFeature: false,
      projectType: "kanban",
      projectState: ProjectStates.DEVELOPMENT,
      allowOrganization: true,
      valid: false,
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ],
      features: Object.freeze([
        {
          name: "estimation",
          text: this.$t("projects.features.features.estimation"),
          icon: "mdi-timelapse"
        },
        {
          name: "meetings",
          text: this.$t("projects.features.features.meetings"),
          icon: "mdi-calendar-star"
        },
        {
          name: "bpmn",
          text: this.$t("projects.features.features.bpmn"),
          icon: "mdi-chart-donut"
        },
        {
          name: "canvas",
          text: this.$t("projects.features.features.canvas"),
          icon: "mdi-file-document-box-check"
        },
        {
          name: "weather",
          text: this.$t("projects.features.features.weather"),
          icon: "mdi-white-balance-sunny"
        }
      ]),
      selectedFeatures: []
    };
  },
  computed: {
    projectFeatures() {
      return this.selectedFeatures.map((feature) => this.features.find((feat) => feat.name === feature));
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
    },
    onSelectFeature(feature) {
      if (!this.selectedFeatures.includes(feature)) {
        this.selectedFeatures.push(feature);
      }
    },
    removeFeature(feature) {
      const index = this.selectedFeatures.findIndex((feat) => feat === feature);
      if (index !== -1) {
        this.selectedFeatures.splice(index, 1);
      }
    },
    create() {
      Meteor.call(
        "projects.create",
        {
          organizationId: this.organizationId,
          name: this.name,
          projectType: this.projectType,
          projectGroupId: this.$store.state.selectedGroup._id,
          state: this.projectState,
          accessRights: this.allowOrganization
            ? ProjectAccessRights.ORGANIZATION
            : ProjectAccessRights.PRIVATE,
          features: this.selectedFeatures
        },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.close();
          this.$router.push({
            name: "project",
            params: { projectId: result }
          });
        }
      );
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
    },

    getVisibilityIcon(allowOrganization) {
      if (allowOrganization) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },

    getVisibilityText(allowOrganization) {
      if (allowOrganization) {
        return this.$t("Organization");
      }
      return this.$t("The project is private");
    },

    isStep1Completed() {
      return this.name && this.name.length > 0;
    }
  }
};
</script>

<style scoped>
.stepper {
  box-shadow: none;
}
</style>
