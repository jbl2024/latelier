<template>
  <div class="organization-settings-general">
    <v-subheader>Titre</v-subheader>
    <v-card>
      <div class="description">
        <div
          v-show="!editName && organization.name && organization.name.length > 0"
          @click="startEditName"
        >{{ organization.name }}</div>
        <div v-show="!organization.name && !editName" @click="startEditName">Aucun nom</div>
        <div v-show="editName">
          <v-text-field
            :label="$t('Name')"
            ref="name"
            v-focus
            v-model="organization.name"
            @keyup.enter="updateName"
          ></v-text-field>
          <v-btn icon @click="updateName">
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="cancelUpdateName">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
    <v-subheader>Description</v-subheader>
    <v-card>
      <div class="description">
        <div
          v-show="!editDescription && organization.description && organization.description.length > 0"
          @click="startEditDescription"
        >
          <div class="ql-editor-view" v-html="markDown(organization.description)"></div>
        </div>
        <div
          v-show="!organization.description && !editDescription"
          @click="startEditDescription"
        >{{ $t('No description') }}</div>
        <div v-show="editDescription">
          <v-textarea
            ref="description"
            solo
            label="Description"
            v-model="organization.description"
            @keydown.shift.enter="updateDescription"
          ></v-textarea>
          <v-btn icon @click="updateDescription">
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon @click="cancelUpdateDescription">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { Organizations } from "/imports/api/organizations/organizations.js";
import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

export default {
  name: "organization-settings-general",
  mixins: [MarkdownMixin],
  created() {},
  props: {
    organization: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      editDescription: false,
      savedDescription: "",
      editName: false,
      savedName: ""
    };
  },
  methods: {
    startEditDescription() {
      this.savedDescription = this.organization.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.focus());
    },

    updateDescription() {
      this.editDescription = false;
      Meteor.call(
        "organizations.updateDescription",
        this.organization._id,
        this.organization.description
      );
    },

    cancelUpdateDescription() {
      this.editDescription = false;
      this.organization.description = this.savedDescription;
    },

    startEditName() {
      this.savedName = this.organization.name;
      this.editName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateName() {
      this.editName = false;
      Meteor.call(
        "organizations.updateName",
        this.organization._id,
        this.organization.name
      );
    },

    cancelUpdateName() {
      this.editName = false;
      this.organization.name = this.savedName;
    }
  }
};
</script>

<style scoped>
.description {
  margin-left: 24px;
  margin-right: 24px;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>