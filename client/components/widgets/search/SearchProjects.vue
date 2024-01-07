<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate absolute top />
    <project-list
      :projects="projects"
      empty-illustration="empty"
      @select="onSelectProject"
    />
    <div class="text-xs-center">
      <v-pagination
        v-if="pagination.totalPages > 1"
        v-model="page"
        :total-visible="5"
        :length="pagination.totalPages"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    filter: {
      type: String,
      default: ""
    },
    organizationId: {
      type: String,
      default: null
    },
    autoSearch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      projects: null,
      projectCount: 0,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  computed: {
    ...mapState(["showArchivedProjects"])
  },
  watch: {
    page() {
      this.find();
    },
    filter: {
      immediate: true,
      handler() {
        if (this.page !== 1) {
          this.page = 1;
        } else {
          this.find();
        }
      }
    }
  },
  methods: {
    async find() {
      if (this.autoSearch === false && (!this.filter || !this.filter.length === 0)) return;
      this.loading = true;

      try {
        const result = await Meteor.callAsync("search.findProjects", {
          name: this.filter,
          organizationId: this.organizationId,
          page: this.page,
          showArchivedProjects: this.showArchivedProjects
        });

        this.loading = false;
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = result.totalPages;
        this.projects = result.data;
        this.projectCount = result.totalItems;
        this.$emit("update:projectCount", this.projectCount);
      } catch (error) {
        this.loading = false;
        this.$notifyError(error);
      }
    },

    onSelectProject(project) {
      this.$emit("select", project);
    }
  }
};
</script>
