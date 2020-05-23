<template>
  <div class="select-label">
    <edit-label ref="editLabel" :label-id="selectedLabelId" />
    <generic-dialog v-model="showDialog" :title="$t('Add label')" simple>
      <template v-slot:content>
        <new-label ref="newLabel" :project-id="projectId" />
        <v-btn
          v-show="false"
          v-shortkey="['s']"
          icon
          text
          @click="showSearch = !showSearch"
          @shortkey="showSearch = !showSearch"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-text-field
          v-if="!$vuetify.breakpoint.xsOnly && showSearch"
          :label="$t('Search') + '...'"
          single-line
          append-icon="mdi-magnify"
          clearable
          autofocus
          @input="debouncedFilter"
        />
        <v-list class="content">
          <template v-for="aLabel in labels">
            <v-list-item
              :key="aLabel._id"
              @click="selectLabel(aLabel)"
              @mouseover="showButtons = aLabel._id"
              @mouseleave="showButtons = null"
            >
              <v-list-item-avatar>
                <v-icon :style="getColor(aLabel)">
                  mdi-label
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content class="pointer">
                <v-list-item-title>{{ aLabel.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon
                  v-show="showButtons === aLabel._id"
                  @click.stop="editLabel(aLabel._id)"
                >
                  mdi-pencil
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </template>
          <v-list-item @click="$refs.newLabel.open()">
            <v-list-item-avatar>
              <v-icon>mdi-label</v-icon>
            </v-list-item-avatar>
            <v-list-item-content class="cursor">
              <v-list-item-title>{{ $t("Create") }}...</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { Labels } from "/imports/api/labels/labels.js";
import debounce from "lodash/debounce";

export default {
  props: {
    labelId: {
      type: String,
      default: ""
    },
    projectId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showSearch: false,
      showDialog: false,
      showSelectColor: false,
      label: {},
      debouncedFilter: null,
      search: "",
      name: "",
      selectedLabelId: "",
      showButtons: ""
    };
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  meteor: {
    labels: {
      params() {
        return {
          projectId: this.projectId,
          search: this.search
        };
      },
      update({ projectId, search }) {
        const query = {
          projectId: projectId
        };
        if (search) {
          query.name = {
            $regex: `.*${search}.*`,
            $options: "i"
          };
        }
        return Labels.find(query, { sort: { name: 1 } });
      }
    }
  },
  methods: {
    open() {
      this.showDialog = true;
    },

    selectLabel(label) {
      this.showSearch = false;
      this.showDialog = false;
      this.$emit("select", label);
    },

    getColor(label) {
      return `color: ${label.color}`;
    },

    editLabel(id) {
      this.selectedLabelId = id;
      this.$refs.editLabel.open();
    }
  }
};
</script>

<style scoped>
.content {
  overflow-y: scroll;
  max-height: 400px;
}
</style>
