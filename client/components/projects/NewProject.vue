<template>
  <div class="new-project">
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
      projectType: "kanban",
      projectState: ProjectStates.DEVELOPMENT,
      allowOrganization: true,
      valid: false,
      name: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => v.length > 1 || this.$t("Name is too short")
      ]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
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
            : ProjectAccessRights.PRIVATE
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
