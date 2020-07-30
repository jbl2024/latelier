<template>
  <div class="new-project">
    <select-feature
      :active.sync="showSelectFeature"
      :features="features"
      @select="onSelectFeature"
    />
    <generic-dialog
      v-model="showDialog"
      max-width="420"
      :title="$t('New project')"
    >
      <template v-slot:content>
        <v-form v-model="valid" @submit.prevent>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  autofocus
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                  @keyup.enter="create()"
                />
              </v-col>
              <v-col cols="6">
                <label>{{ $t("Template") }}</label>
                <v-radio-group v-model="projectType">
                  <v-radio color="accent" label="Kanban" value="kanban" />
                  <v-radio color="accent" :label="$t('People')" value="people" />
                  <v-radio color="accent" :label="$t('Empty')" value="none" />
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <label>{{ $t("State") }}</label>
                <v-radio-group v-model="projectState">
                  <v-radio
                    v-for="item in projectStates()"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    color="accent"
                  />
                </v-radio-group>
              </v-col>
              <v-col v-if="organizationId" cols="12">
                <v-subheader>{{ $t("Access rights") }}</v-subheader>
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
              </v-col>
              <v-col cols="12">
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
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </template>

      <template v-slot:actions>
        <v-btn text :disabled="!valid" @click="create">
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
      default: ""
    }
  },
  data() {
    return {
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
        { name: "estimation", text: this.$t("projects.features.features.estimation"), icon: "mdi-timelapse" },
        { name: "meetings", text: this.$t("projects.features.features.meetings"), icon: "mdi-calendar-star" },
        { name: "bpmn", text: this.$t("projects.features.features.bpmn"), icon: "mdi-chart-donut" }
      ]),
      selectedFeatures: []
    };
  },
  computed: {
    projectFeatures() {
      return this.selectedFeatures.map((
        feature
      ) => this.features.find((feat) => feat.name === feature));
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
    }
  }
};
</script>
