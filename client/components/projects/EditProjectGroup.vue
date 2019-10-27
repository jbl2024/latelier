<template>
  <div class="edit-project-group">
    <v-dialog
      v-model="showDialog"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title class="headline">
          Editer la catégorie
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent>
            <v-text-field
              v-model="projectGroup.name"
              :rules="nameRules"
              :label="$t('Name')"
              required
              @keyup.enter="updateName()"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ this.$t("Cancel") }}
          </v-btn>
          <v-btn color="error" :disabled="!valid" @click="remove">
            {{ this.$t("Delete") }}
          </v-btn>
          <v-btn color="info" :disabled="!valid" @click="updateName">
            Modifier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";

export default {
  props: {
    projectGroupId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showDialog: false,
      projectGroup: {},
      valid: false,
      name: "",
      nameRules: [(v) => !!v || this.$t("Name is mandatory")]
    };
  },
  meteor: {
    projectGroup: {
      params() {
        return {
          id: this.projectGroupId
        };
      },
      deep: false,
      update({ id }) {
        return ProjectGroups.findOne({ _id: id }) || {};
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },
    updateName() {
      Meteor.call(
        "projectGroups.updateName",
        this.projectGroup._id,
        this.projectGroup.name,
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.showDialog = false;
        }
      );
    },

    remove() {
      /* eslint no-alert: off */
      /* eslint no-restricted-globals: off */
      if (confirm("Voulez-vous supprimer définitivement cette catégorie ?")) {
        this.showDialog = false;
        Meteor.call(
          "projectGroups.remove",
          this.projectGroup._id,
          (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
            }
          }
        );
      }
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
