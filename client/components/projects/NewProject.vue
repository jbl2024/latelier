<template>
  <div class="new-project">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn
            v-shortkey="['esc']"
            icon
            text
            @click="close()"
            @shortkey="close()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t("New project") }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  ref="name"
                  v-model="name"
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                  @keyup.enter="create()"
                />
              </v-flex>
              <v-flex sm6 md6>
                <label>{{ $t("Template") }}</label>
                <v-radio-group v-model="projectType">
                  <v-radio label="Kanban" value="kanban" />
                  <v-radio :label="$t('People')" value="people" />
                  <v-radio :label="$t('Empty')" value="none" />
                </v-radio-group>
              </v-flex>
              <v-flex sm6 md6>
                <label>{{ $t("State") }}</label>
                <v-radio-group v-model="projectState">
                  <v-radio
                    v-for="item in projectStates()"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </v-radio-group>
              </v-flex>
              <v-flex v-if="organizationId" xs12>
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
                        @click="allowOrganization = !allowOrganization"
                      />
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn color="primary" :disabled="!valid" @click="create">
            {{ $t("Create") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      this.$nextTick(() => this.$refs.name.focus());
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
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$router.push({
            name: "project",
            params: { projectId: result }
          });
        }
      );
      this.showDialog = false;
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

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
}
</style>
