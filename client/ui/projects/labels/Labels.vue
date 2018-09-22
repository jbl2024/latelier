<template>

<div class="labels">
  <new-label ref="newLabel" :projectId="projectId"></new-label>  
  <edit-label ref="editLabel" :labelId="selectedLabelId"></edit-label>
  <div v-if="$subReady.labels">
    <md-list>
      <md-subheader>Labels</md-subheader>
      <md-list-item v-for="label in labels" 
          :key="label._id" 
          @mouseover="showButtons = label._id" 
          @mouseleave="showButtons = null">
        <md-icon>label</md-icon>
        <span class="md-list-item-text">{{label.name}}</span>

        <md-button class="md-icon-button md-list-action" @click.stop="openMenu(label._id)" v-show="showButtons === label._id">
          <md-icon>settings</md-icon>
          <md-tooltip md-delay="300">Paramètres</md-tooltip>
        </md-button>

      </md-list-item>
      <md-list-item @click="$refs.newLabel.open()">
        <md-icon>add</md-icon>
        <span class="md-list-item-text">Créer...</span>
      </md-list-item>
    </md-list>
  </div>
</div>

</template>

<script>
import { Labels } from '/imports/api/labels/labels.js'
import { Projects } from '/imports/api/projects/projects.js'

export default {
  props: {
    projectId: {
      type: String,
      default: 0
    }
  },
  data() {
    return {
      showButtons: '',
      selectedLabelId: ''
    };
  },
  meteor: {
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      'labels': function() {
        // Here you can use Vue reactive properties
        return [this.projectId] // Subscription params
      }
    },
    labels () {
      return Labels.find({}, {sort: {name: 1}});
    },
  },
  methods: {
    removeLabel (label) {
      Meteor.call('labels.remove', label._id);
    },

    openMenu (id) {
      console.log(id)
      this.selectedLabelId = id;
      this.$refs.editLabel.open();
    }
  }
};
</script>

<style scoped>
.md-list-item {
  cursor: pointer;
}
.md-list-item:hover {
  background-color: #eee;
}

.selected {
  color: var(--md-theme-default-primary, #448aff) !important;
}

</style>