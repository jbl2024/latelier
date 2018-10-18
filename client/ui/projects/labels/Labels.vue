<template>

<div class="labels">
  <new-label ref="newLabel" :projectId="projectId"></new-label>  
  <edit-label ref="editLabel" :labelId="selectedLabelId"></edit-label>
  <div v-if="$subReady.labels">
    <v-list dense class="pt-0">
      <v-subheader>Labels</v-subheader>
      <v-list-tile 
          v-for="label in labels"
          :key="label._id" 
          @mouseover="showButtons = label._id" 
          @mouseleave="showButtons = null">

        <v-list-tile-avatar>
          <v-icon :style="getColor(label)">label</v-icon>
        </v-list-tile-avatar>

        <v-list-tile-content @click="selectLabel(label)" class="pointer">
          <v-list-tile-title :class="getClassForName(label, selectedLabels)">{{ label.name }}</v-list-tile-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <v-btn icon ripple @click.stop="openMenu(label._id)" v-show="showButtons === label._id"> 
            <v-icon color="grey lighten-1">settings</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile @click="$refs.newLabel.open()"> 

        <v-list-tile-avatar>
          <v-icon>add</v-icon>
        </v-list-tile-avatar>

        <v-list-tile-content>
          <v-list-tile-title>Créer...</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </div>
</div>

</template>

<script>
import { Labels } from '/imports/api/labels/labels.js'
import { Projects } from '/imports/api/projects/projects.js'
import { mapState } from 'vuex';

export default {
  props: {
    projectId: {
      type: String,
      default: 0
    }
  },
  computed: {
    ...mapState(['selectedLabels'])
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
      this.selectedLabelId = id;
      this.$refs.editLabel.open();
    },

    selectLabel (label) {
      this.$store.dispatch('selectLabel', label);
    },

    getColor (label) {
      return 'color: ' + label.color;
    },

    getClassForName (label, selectedLabels) {
      var isSelected = selectedLabels.some(aLabel => { return aLabel._id === label._id});
      if (isSelected) {
        return 'selected';
      }
      return '';
    }

  }
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}

.selected {
  font-weight: bold;
  /* color: var(--md-theme-default-primary, #448aff) !important; */
}

</style>