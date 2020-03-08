<template>
  <div class="select-project">
    <generic-dialog
      v-model="showDialog"
      max-width="820"
      :title="$t('Select a project')"
    >
      <template v-slot:content>
        <v-text-field
          v-model="search"
          :label="$t('Search') + '...'"
          single-line
          append-icon="mdi-magnify"
          clearable
          @input="debouncedFilter"
        />

        <v-list class="content">
          <template v-for="project in projects">
            <v-list-item :key="project._id" @click="selectProject(project)">
              <v-list-item-avatar :color="getColor(project)">
                <v-icon :class="getVisibilityIconClass(project)">
                  {{ getVisibilityIcon(project) }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content class="pointer">
                <v-list-item-title>{{ project.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatProjectDates(project) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list>
        <div class="text-xs-center pb-2 flex0">
          <v-pagination
            v-if="showDialog && pagination.totalPages > 1"
            v-model="page"
            :length="pagination.totalPages"
          />
        </div>
      </template>
    </generic-dialog>
  </div>
</template>

<script>
import { ProjectAccessRights } from "/imports/api/projects/projects";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

import debounce from "lodash/debounce";

export default {
  mixins: [DatesMixin],
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      search: "",
      debouncedFilter: null,
      projects: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  watch: {
    showDialog(showDialog) {
      if (showDialog) {
        this.page = 1;
        this.refresh();
      }
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    },
    page() {
      this.refresh();
    }
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  i18n: {
    messages: {
      en: {
        "Select a project": "Select a project",
        None: "None"
      },
      fr: {
        "Select a project": "Sélectionner un projet",
        None: "Aucun"
      }
    }
  },
  methods: {
    refresh() {
      this.loading = true;
      Meteor.call(
        "projects.load",
        { name: this.search, page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.projects = result.data;
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    selectProject(project) {
      this.showDialog = false;
      this.$emit("select", project);
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return `Du ${this.formatDate(project.startDate)} au ${this.formatDate(
          project.endDate
        )}`;
      }
      if (project.startDate) {
        return `A partir du ${this.formatDate(project.startDate)}`;
      }
      if (project.endtDate) {
        return `Jusqu'au ${this.formatDate(project.endDate)}`;
      }
      return "";
    },

    getVisibilityIcon(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "mdi-eye";
      }
      return "mdi-eye-off";
    },

    getVisibilityIconClass(project) {
      if (project.accessRights === ProjectAccessRights.ORGANIZATION) {
        return "";
      }
      return "";
    },

    getColor(project) {
      return project.color;
    }
  }
};
</script>

<style scoped>
@media (max-width: 600px) {
  .content {
    overflow-y: auto;
  }
}

@media (min-width: 601px) {
  .content {
    overflow-y: auto;
    height: 320px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1; /* takes the remaining height of the "container" div */
    overflow: auto; /* to scroll just the "main" div */
  }
}

</style>
