<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate absolute top />
    <attachments
      :attachments="attachments"
      empty-illustration="empty"
      with-meetings
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
import Attachments from "/imports/ui/attachments/Attachments";

export default {
  components: {
    Attachments
  },
  props: {
    filter: {
      type: String,
      default: ""
    },
    projectId: {
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
      attachments: [],
      attachmentCount: 0,
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
    find() {
      if (this.autoSearch === false && (!this.filter || !this.filter.length === 0)) return;
      this.loading = true;
      Meteor.call(
        "search.findAttachments",
        {
          name: this.filter,
          projectId: this.projectId,
          page: this.page,
          showArchivedProjects: this.showArchivedProjects
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
          this.attachments = Array.isArray(result?.data) ? result.data : [];
          this.attachmentCount = result.totalItems;
          this.$emit("update:attachment-count", this.attachmentCount);
        }
      );
    },

    onSelectProject(project) {
      this.$emit("select", project);
    }
  }
};
</script>
