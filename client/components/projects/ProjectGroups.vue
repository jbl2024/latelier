<template>
  <div class="project-groups">
    <new-project-group
      ref="newProjectGroup"
      :organization-id="organizationId"
    />
    <edit-project-group
      ref="editProjectGroup"
      :project-group-id="selectedProjectGroupId"
    />

    <v-list dense class="pt-0">
      <v-subheader>{{ $t("Categories") }}</v-subheader>
      <v-list-item
        v-for="group in groups"
        :key="group._id"
        @click="selectGroup(group)"
        @mouseover="showButtons = group._id"
        @mouseleave="showButtons = null"
      >
        <v-list-item-action>
          <v-icon :style="getColor(group)">
            mdi-folder
          </v-icon>
        </v-list-item-action>

        <v-list-item-content class="pointer">
          <v-list-item-title :class="getColor(group)">
            {{ group.name }}
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn
            v-show="showButtons === group._id"
            icon
            ripple
            @click.stop="openMenu(group._id)"
          >
            <v-icon color="grey lighten-1">
              mdi-settings
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-list-item @click="$refs.newProjectGroup.open()">
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title>{{ this.$t("Create") }}...</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";

export default {
  props: {
    organizationId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      showButtons: "",
      selectedProjectGroupId: ""
    };
  },
  meteor: {
    groups() {
      return ProjectGroups.find({}, { sort: { name: 1 } });
    }
  },
  methods: {
    removeGroup(group) {
      Meteor.call("projectGroups.remove", group._id);
    },

    selectGroup(group) {
      const { selectedGroup } = this.$store.state;
      if (selectedGroup && selectedGroup._id === group._id) {
        this.$store.dispatch("setSelectedGroup", null);
      } else {
        this.$store.dispatch("setSelectedGroup", group);
      }
    },

    getColor(group) {
      const { selectedGroup } = this.$store.state;
      if (selectedGroup && selectedGroup._id === group._id) {
        return "selected";
      }
      return "";
    },

    openMenu(id) {
      this.selectedProjectGroupId = id;
      this.$refs.editProjectGroup.open();
    }
  }
};
</script>

<style scoped>
</style>
