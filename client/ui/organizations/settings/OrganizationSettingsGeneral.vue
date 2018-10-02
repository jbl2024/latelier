<template>
  <div class="organization-settings-general"> 

  <md-subheader>Titre</md-subheader>
  <div class="md-elevation-1">
    <div class="description">
      <div v-show="!editName && organization.name && organization.name.length > 0" @click="startEditName">
        {{ organization.name }}
      </div>
      <div v-show="!organization.name && !editName" @click="startEditName">
        Aucun nom
      </div>

      <div v-show="editName">
        <md-field>
          <label>Nom</label>
          <md-input ref="name" v-focus v-model="organization.name" @keyup.enter="updateName"></md-input>
        </md-field>
        <md-button class="md-icon-button" @click.native="updateName">
          <md-icon>check_circle</md-icon>
        </md-button>

        <md-button class="md-icon-button" @click.native="cancelUpdateName">
          <md-icon>cancel</md-icon>
        </md-button>

      </div>
    </div>
  </div>

  <md-subheader>Description</md-subheader>
  <div class="md-elevation-1">
    <div class="description">
      <div v-show="!editDescription && organization.description && organization.description.length > 0" @click="startEditDescription">
        <div v-html="markDown(organization.description)"></div>
      </div>
      <div v-show="!organization.description && !editDescription" @click="startEditDescription">
        Aucune description
      </div>

      <div v-show="editDescription">
        <md-field>
          <label>Description</label>
          <md-textarea ref="description" v-model="organization.description" @keyup.ctrl.enter="updateDescription"></md-textarea>
        </md-field>
        <md-button class="md-icon-button" @click.native="updateDescription">
          <md-icon>check_circle</md-icon>
        </md-button>

        <md-button class="md-icon-button" @click.native="cancelUpdateDescription">
          <md-icon>cancel</md-icon>
        </md-button>

      </div>
    </div>
  </div>
</div>
</template>

<script>
import { Organizations } from '/imports/api/organizations/organizations.js'
import MarkdownMixin from '/imports/ui/mixins/MarkdownMixin.js'

export default {
  name: 'organization-settings-general',
  mixins: [MarkdownMixin],
  created () {
  },
  props: {
    organization: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      editDescription: false,
      savedDescription: '',
      editName: false,
      savedName: '',
    }
  },
  methods: {
    startEditDescription () {
      this.savedDescription = this.organization.description;
      this.editDescription = true;
      this.$nextTick(() => this.$refs.description.$el.focus());
    },

    updateDescription () {
      this.editDescription = false;
      Meteor.call('organizations.updateDescription', this.organization._id, this.organization.description);
    },

    cancelUpdateDescription () {
      this.editName = false;
      this.organization.description = this.savedDescription;
    },

    startEditName () {
      this.savedName = this.organization.name;
      this.editName = true;
      this.$nextTick(() => this.$refs.name.$el.focus());
    },

    updateName () {
      this.editName = false;
      Meteor.call('organizations.updateName', this.organization._id, this.organization.name);
    },

    cancelUpdateName () {
      this.editName = false;
      this.organization.name = this.savedName;
    },
  }
}
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