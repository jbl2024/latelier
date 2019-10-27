<template>
  <div class="select-group">
    <v-dialog
      :value="active"
      max-width="420"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <new-project-group
        ref="newProjectGroup"
        :organization-id="organizationId"
      />
      <v-card>
        <v-card-title class="headline">
          Choisir une catégorie
        </v-card-title>
        <v-card-text>
          <v-list class="content">
            <template v-for="group in groups">
              <v-list-item :key="group._id" @click="selectGroup(group)">
                <v-list-item-avatar>
                  <v-icon>mdi-folder</v-icon>
                </v-list-item-avatar>
                <v-list-item-content class="cursor">
                  <v-list-item-title>{{ group.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item @click="$refs.newProjectGroup.open()">
              <v-list-item-avatar>
                <v-icon>mdi-folder</v-icon>
              </v-list-item-avatar>
              <v-list-item-content class="cursor">
                <v-list-item-title>{{ this.$t("Create") }}...</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">
            {{ this.$t("Cancel") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";

export default {
  props: {
    organizationId: {
      type: String,
      default: ""
    },
    active: Boolean
  },
  data() {
    return {};
  },
  meteor: {
    groups() {
      return ProjectGroups.find();
    }
  },
  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    selectGroup(group) {
      this.$emit("update:active", false);
      this.$emit("select", group);
    }
  }
};
</script>

<style scoped>
.content {
  margin-left: 24px;
  margin-right: 24px;
  overflow-y: scroll;
}

.cursor {
  cursor: pointer;
}
</style>
