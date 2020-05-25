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
        v-if="pagination.totalPages > 0"
        v-model="page"
        :total-visible="5"
        :length="pagination.totalPages"
      />
    </div>
  </div>
</template>

<script>

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
    find() {
      if (this.autoSearch === false && (!this.filter || !this.filter.length === 0)) return;
      this.loading = true;
      Meteor.call(
        "search.findProjects",
        {
          name: this.filter,
          organizationId: this.organizationId,
          page: this.page
        },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPages;

          this.projects = result.data;
          this.projectCount = result.totalItems;
          this.$emit("update:projectCount", this.projectCount);
        }
      );
    },

    onSelectProject(project) {
      this.$emit("select", project);
    }
  }
};
</script>
