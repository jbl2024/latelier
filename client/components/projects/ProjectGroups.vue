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
    <!-- Display as Autocomplete (eg: timeline filters -->
    <v-autocomplete
      v-model="selectedGroup"
      v-if="display === 'autocomplete'"
      :label="$t('Categories')"
      class="compact-form auto-complete"
      dense
      :no-data-text="$t('No categories')"
      item-text="name"
      item-value="_id"
      :items="items"
      return-object
      hide-details
      menu-props="closeOnContentClick"
    >
      <template v-slot:item="{ item }"
        @click="selectGroup(item)"
        @mouseover="showButtons = item._id"
        @mouseleave="showButtons = null"
      >
        <v-list-item-action>
          <v-icon :style="getColor(item)">
            mdi-folder
          </v-icon>
        </v-list-item-action>
        <v-list-item-content class="pointer">
          <v-list-item-title :class="getColor(item)">
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="item._id">
          <v-btn
            icon
            ripple
            @click.stop="openMenu(item._id)"
          >
            <v-icon color="grey lighten-1">
              mdi-settings
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
      <template v-slot:append-item>
        <v-divider />
        <v-list-item @click="$refs.newProjectGroup.open()">
          <v-list-item-action>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ $t("Create") }}...</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-autocomplete>
    <!-- Display as list -->
    <v-list v-else-if="display === 'list'" dense class="pt-0">
      <v-subheader>{{ $t("Categories") }}</v-subheader>

      <project-groups-item :project-group="data.item" />
      <!--
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
      -->
      <v-divider />
      <v-list-item @click="$refs.newProjectGroup.open()">
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title>{{ $t("Create") }}...</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
    </v-list>
  </div>
</template>

<script>
import { ProjectGroups } from "/imports/api/projectGroups/projectGroups.js";
import { mapState } from "vuex";

export default {
  props: {
    organizationId: {
      type: String,
      default: null
    },
    display: {
      type: String,
      default: "list",
      validator: (display) => ["list", "autocomplete"].includes(display)
    }
  },
  data() {
    return {
      showButtons: "",
      selectedProjectGroupId: "",
    };
  },
  computed: {
    selectedGroup: {
      get() {
        return this.$store.state.selectedGroup;
      },
      set(newSelectedGroup) {
        return this.$store.dispatch("setSelectedGroup", newSelectedGroup._id ? newSelectedGroup : null);
      }
    },
    items() {
      return [{_id: null, name: this.$t("None")}].concat(this.groups);
    }
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
      this.selectedGroup = this.selectedGroup 
      && this.selectedGroup._id === group._id ? null : group;
    },
    getColor(group) {
      return this.$store.state.selectedGroup 
      && this.$store.state.selectedGroup._id === group._id
      ? "selected" : "";
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
