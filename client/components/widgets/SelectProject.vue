<template>
  <div class="select-project">
    <v-dialog
      :value="active"
      max-width="820"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      @input="$emit('update:active')"
    >
      <v-card class="flex-container">
        <v-card-title class="headline">
          {{ $t("Select a project") }}
        </v-card-title>

        <div class="flex0 search">
          <v-text-field
            v-model="search"
            :label="$t('Search') + '...'"
            single-line
            append-icon="mdi-magnify"
            clearable
            @input="debouncedFilter"
          />
        </div>

        <v-card-text class="flex1">
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
        </v-card-text>
        <div class="flex0">
          <div class="text-xs-center">
            <v-pagination
              v-if="active && pagination.totalPages > 1"
              v-model="page"
              :length="pagination.totalPages"
            />
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="closeDialog">
              {{ $t("Cancel") }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ProjectAccessRights } from "/imports/api/projects/projects";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

import debounce from "lodash/debounce";

export default {
  mixins: [DatesMixin],
  props: {
    active: Boolean
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
  watch: {
    active(active) {
      if (active) {
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
    closeDialog() {
      this.$emit("update:active", false);
    },

    refresh() {
      this.loading = true;
      Meteor.call(
        "projects.load",
        { name: this.search, page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
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
        this.pagination.rowsPerPage == null
        || this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    selectProject(project) {
      this.$emit("update:active", false);
      this.$emit("select", project);
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return `Du ${this.formatDate(project.startDate)} au ${this.formatDate(project.endDate)}`;
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
.content {
  overflow-y: scroll;
}

.search {
  padding-left: 48px;
  padding-right: 48px;
}

@media (max-width: 600px) {
  .search {
    padding-left: 12px;
    padding-right: 12px;
  }
}

@media (min-width: 601px) {
  .flex-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    min-height: 360px;
    max-height: 530px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1;
    overflow-y: scroll;
  }
}
</style>
