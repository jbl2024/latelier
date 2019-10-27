<template>
  <div class="labels">
    <new-label ref="newLabel" :project-id="projectId" />
    <edit-label ref="editLabel" :label-id="selectedLabelId" />
    <template v-if="$subReady.labels">
      <template v-if="mode === 'select'">
        <div v-if="labels.length > 0">
          <v-autocomplete
            v-model="selectedLabels"
            class="auto-complete"
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
                <v-list-item-action>
                  <v-icon :style="getColor(data.item)">
                    mdi-label
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>
                    <span :class="isSelected(data.item) ? 'selected' : ''">
                      {{ data.item.name }}</span>
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </template>
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0" small :style="getStyleForChip(item)">
                {{ ellipsis(item.name, 15) }}
              </v-chip>
              <span v-if="index === 1" class="grey--text caption">
                (+{{ selectedLabels.length - 1 }} {{ $t("others") }})
              </span>
            </template>
          </v-autocomplete>
        </div>
      </template>

      <v-list v-if="mode === 'settings'" class="pt-0">
        <v-list-item
          v-for="label in labels"
          :key="label._id"
          @click="openMenu(label._id)"
        >
          <v-list-item-action>
            <v-icon :style="getColor(label)">
              mdi-label
            </v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title :class="getClassForName(label, selectedLabels)">
              {{ label.name }}
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon ripple @click.stop="openMenu(label._id)">
              <v-icon>mdi-settings</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>

        <v-list-item @click="$refs.newLabel.open()">
          <v-list-item-action>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ this.$t("Create") }}...</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list v-if="mode === 'menu'" dense>
        <v-subheader>Labels</v-subheader>
        <v-list-item
          v-for="label in labels"
          :key="label._id"
          @click="selectLabel(label)"
          @mouseover="showButtons = label._id"
          @mouseleave="showButtons = null"
        >
          <v-list-item-icon>
            <v-icon :style="getColor(label)">
              mdi-label
            </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title :class="getClassForName(label, selectedLabels)">
              {{ label.name }}
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-icon
              v-show="showButtons === label._id"
              small
              color="grey lighten-1"
              @click.stop="openMenu(label._id)"
            >
              mdi-settings
            </v-icon>
          </v-list-item-action>
        </v-list-item>

        <v-list-item @click="$refs.newLabel.open()">
          <v-list-item-icon>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ this.$t("Create") }}...</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script>
import { Labels } from "/imports/api/labels/labels.js";
import { colors } from "/imports/colors.js";

export default {
  props: {
    projectId: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      default: "menu"
    }
  },
  data() {
    return {
      showButtons: "",
      selectedLabelId: ""
    };
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
  meteor: {
    $subscribe: {
      // Subscribes to the 'threads' publication with no parameters
      labels() {
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
      Meteor.call("labels.remove", { labelId: label._id });
    },

    openMenu(id) {
      this.selectedLabelId = id;
      this.$refs.editLabel.open();
    },

    selectLabel(label) {
      this.$store.dispatch("projectFilters/selectLabel", label);
    },

    getColor(label) {
      return `color: ${label.color}`;
    },

    getStyleForChip(label) {
      return `
        background-color: ${label.color};
        color: ${colors.getLabelColor(label.color)}
      `;
    },

    getClassForName(label, selectedLabels) {
      const isSelected = selectedLabels.some(
        (aLabel) => aLabel._id === label._id
      );
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
    },

    isSelected(item) {
      const isSelected = this.selectedLabels.some(
        (aLabel) => aLabel._id === item._id
      );
      return isSelected;
    },

    ellipsis(item, n) {
      return item.length > n ? `${item.substr(0, n - 1)}…` : item;
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

.auto-complete {
  max-width: 320px;
}

.selected {
  font-size: bold;
}
</style>
