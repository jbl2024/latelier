<template>
  <div>
    <v-autocomplete
      v-model="selectedProject"
      class="auto-complete"
      :items="projects"
      :label="$t('Projects')"
      :no-data-text="$t('No project')"
      :item-text="getItemLabel"
      :item-value="getItemValue"
      :value-comparator="valueComparator"
      clearable
      menu-props="closeOnContentClick"
    >
      <template v-slot:item="data">
        <template>
          <v-list-item-content>
            <v-list-item-title>
              <span>
                {{ getItemLabel(data.item) }}
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </template>
      </template>
    </v-autocomplete>

  </div>
</template>
<script>
import { Projects } from "/imports/api/projects/projects";
export default {
  props: {
    value: {
      type: Object,
      default: null
    },
    getItemLabel: {
      type: Function,
      default(item) {
        return item.name;
      }
    },
    getItemValue: {
      type: Function,
      default(item) {
        return item;
      }
    },
    valueComparator: {
      type: Function,
      default(item, selected) {
        if (!selected) return false;
        return item._id === selected._id
      }
    }
  },
  data() {
    return {
      loading: false,
      projects: []
    }
  },
  computed: {
    selectedProject: {
      get() {
        return this.value;
      },
      set(selectedProject) {
        this.$emit('input', selectedProject);
      }
    }
  },
  methods: {
    fetchProjects() {
      Meteor.call("projects.load",{ name: '', page:1}, (error, result) => {
        this.loading = false;
        if (error) {
          this.$notifyError(error);
          return;
        }
        this.projects = result.data;
      });
    }
  },
  mounted() {
    this.fetchProjects();
  }
}
</script>