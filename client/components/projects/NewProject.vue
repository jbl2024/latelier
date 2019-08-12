<template>
  <div class="new-project">
    <v-dialog v-model="showDialog" max-width="420" :fullscreen="$vuetify.breakpoint.xsOnly">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon text @click="close()" v-shortkey="['esc']" @shortkey="close()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <span>{{ $t("New project") }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form v-model="valid" v-on:submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="name" ref="name" :rules="nameRules" :label="$t('Name')" v-on:keyup.enter="create()" required></v-text-field>
              </v-flex>
              <v-flex sm6 md6>
                <label>{{ $t('Template') }}</label>
                <v-radio-group v-model="projectType">
                  <v-radio label="Kanban" value="kanban"></v-radio>
                  <v-radio :label="$t('People')" value="people"></v-radio>
                  <v-radio :label="$t('Empty')" value="none"></v-radio>
                </v-radio-group>
              </v-flex>
              <v-flex sm6 md6>
                <label>{{ $t('State') }}</label>
                <v-radio-group v-model="projectState">
                  <v-radio v-for="item in projectStates()" :key="item.value" :label="item.label" :value="item.value"></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="create" :disabled="!valid">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { Projects } from "/imports/api/projects/projects.js";
import { ProjectStates } from "/imports/api/projects/projects.js";

export default {
  props: {
    organizationId: {
      type: String,
      defaultValue: "0"
    }
  },
  data() {
    return {
      showDialog: false,
      projectType: "kanban",
      projectState: ProjectStates.DEVELOPMENT,
      valid: false,
      name: "",
      nameRules: [
        v => !!v || this.$t('Name is mandatory'),
        v => v.length > 1 || this.$t('Name is too short')
      ]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => this.$refs.name.focus());
    },
    close () {
      this.showDialog = false;
    },
    create() {
      Meteor.call(
        "projects.create",{
          organizationId: this.organizationId,
          name: this.name,
          projectType: this.projectType,
          projectGroupId: this.$store.state.selectedGroup._id,
          state: this.projectState
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
.content {
  margin-left: 24px;
  margin-right: 24px;
}
</style>