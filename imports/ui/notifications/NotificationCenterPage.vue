<template>
  <div class="notification-center-page">
    <v-subheader>{{ $t("Notification center")}}</v-subheader>
    <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
    <notification-list :notifications="notifications" @refresh="refresh"></notification-list>
    <div class="text-xs-center">
      <v-pagination v-if="pagination.totalPages > 0" v-model="page" :length="pagination.totalPages"></v-pagination>
    </div>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

export default {
  watch: {
    page(page) {
      this.refresh();
    }
  },
  mounted() {
    this.refresh();
  },
  data() {
    return {
      notifications: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  methods: {
    refresh() {
      this.loading = true;
      Meteor.call(
        "notifications.load",
        { page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.notifications = result.data;
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  }
};
</script>

<style scoped>
.content {
  overflow-y: auto;
  max-height: 450px;
  min-height: 450px;
}
</style>