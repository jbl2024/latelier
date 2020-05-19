<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate absolute top />
    <organization-list
      :organizations="organizations"
      empty-illustration="empty"
      @select="onSelectOrganization"
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
import OrganizationList from "/imports/ui/organizations/OrganizationList";

export default {
  components: {
    OrganizationList
  },
  props: {
    filter: {
      type: String,
      default: ""
    },
    autoSearch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      organizations: null,
      organizationCount: 0,
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
        "search.findOrganizations",
        {
          name: this.filter,
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

          this.organizations = result.data;
          this.organizationCount = result.totalItems;
          this.$emit("update:organizationCount", this.organizationCount);
        }
      );
    },
    onSelectOrganization(organization) {
      this.$emit("select", organization);
    }
  }
};
</script>
