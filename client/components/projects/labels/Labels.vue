<template>
  <div class="labels">
    <new-label ref="newLabel" :projectId="projectId"></new-label>
    <edit-label ref="editLabel" :labelId="selectedLabelId"></edit-label>
    <template v-if="$subReady.labels">
      <template v-if="mode === 'select'">
        <div class="compact-form" v-if="labels.length > 0">
          <v-autocomplete
            dense
            class="auto-complete"
            v-model="selectedLabels"
            :items="labels"
            :label="$t('Labels')"
            multiple
            :no-data-text="$t('No label available')"
            :item-text="getItemLabel"
            :item-value="getItemValue"
            menu-props="closeOnContentClick"
          >
            <template v-slot:item="data">
              <template>
                <v-list-tile-action>
                  <v-icon :style="getColor(data.item)">label</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ data.item.name }}</v-list-tile-title>
                </v-list-tile-content>
              </template>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip :style="getStyleForChip(item)" v-if="index === 0">{{ item.name }}</v-chip>
              <span
                v-if="index === 1"
                class="grey--text caption"
              >(+{{ selectedLabels.length - 1 }} {{ $t('others') }})</span>
            </template>
          </v-autocomplete>
        </div>
      </template>

      <v-list dense class="pt-0" v-if="mode === 'menu'">
        <v-subheader>Labels</v-subheader>
        <v-list-tile
          @click="selectLabel(label)"
          v-for="label in labels"
          :key="label._id"
          @mouseover="showButtons = label._id"
          @mouseleave="showButtons = null"
        >
          <v-list-tile-action>
            <v-icon :style="getColor(label)">label</v-icon>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title :class="getClassForName(label, selectedLabels)">{{ label.name }}</v-list-tile-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-btn icon ripple @click.stop="openMenu(label._id)" v-show="showButtons === label._id">
              <v-icon color="grey lighten-1">settings</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile @click="$refs.newLabel.open()">
          <v-list-tile-action>
            <v-icon>add</v-icon>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>Créer...</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </template>
  </div>
</template>

<script>
import { Labels } from "/imports/api/labels/labels.js";
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { mapState } from "vuex";

export default {
  props: {
    projectId: {
      type: String,
      default: 0
    },
    mode: {
      type: String,
      default: "menu"
    }
  },
  computed: {
    selectedLabels: {
      get() {
        return this.$store.state.projectFilters.selectedLabels;
      },
      set(value) {
        this.$store.dispatch("projectFilters/selectLabels", value);
      }
    }
  },
  data() {
    return {
      showButtons: "",
      selectedLabelId: "",
    };
  },
  meteor: {
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      labels: function() {
        // Here you can use Vue reactive properties
        return [this.projectId]; // Subscription params
      }
    },
    labels() {
      return Labels.find({}, { sort: { name: 1 } });
    }
  },
  methods: {
    removeLabel(label) {
      Meteor.call("labels.remove", label._id);
    },

    openMenu(id) {
      this.selectedLabelId = id;
      this.$refs.editLabel.open();
    },

    selectLabel(label) {
      this.$store.dispatch("projectFilters/selectLabel", label);
    },

    getColor(label) {
      return "color: " + label.color;
    },

    getStyleForChip(label) {
      const color = `background-color: ${label.color}`;
      return color;
    },

    getClassForName(label, selectedLabels) {
      const isSelected = selectedLabels.some(aLabel => {
        return aLabel._id === label._id;
      });
      if (isSelected) {
        return "selected";
      }
      return "";
    },

    getItemLabel(item) {
      return item.name;
    },

    getItemValue(item) {
      return item;
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
}

.compact-form {
  position: relative;
  top: 7px;
  transform: scale(0.875);
  transform-origin: left;
  display: inline-block;
}
.auto-complete {
  max-width: 320px;
}
</style>