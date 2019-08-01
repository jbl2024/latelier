<template>
  <div class="notifications-dialog">
    <v-dialog :value="active" @input="$emit('update:active')" :fullscreen="$vuetify.breakpoint.xsOnly" max-width="60%">
      <v-toolbar dark color="primary">
        <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ $t('Notifications') }}
        </v-toolbar-title>
      </v-toolbar>       
    <v-card>
      <v-card-text class="content">
        <empty-state
          class="empty-state"
          v-if="!loading && pagination.totalPages == 0"
          :description="$t('No notification') "
          illustration="notifications_empty"
        ></empty-state>

        <notification-list :notifications="notifications" @refresh="refresh" @click="close"></notification-list>
      </v-card-text>
      <div class="text-xs-center">
        <v-pagination v-if="pagination.totalPages > 1" v-model="page" :length="pagination.totalPages"></v-pagination>
      </div>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click="close()">{{ this.$t('Close') }}</v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import { Notifications } from "/imports/api/notifications/notifications.js";

export default {
  created() {
    this.debouncedLoad = debounce(val => {
      const notificationIds = [];
      this.notifications.map(notification => {
        if (!notification.read) notificationIds.push(notification._id);
      });
      if (notificationIds.length === 0) return;

      Meteor.call(
        "notifications.markAsRead",
        {
          notificationIds: notificationIds
        },
        (error, result) => {
          this.refresh();
        }
      );
    }, 2000);
  },
  props: {
    active: Boolean
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
  watch: {
    active(active) {
      if (active) {
        this.page = 1;
        this.refresh();
      } else {
        this.debouncedLoad.cancel();
      }
    },
    page(page) {
      this.refresh();
    }
  },

  methods: {
    close() {
      this.$emit("update:active", false);      
    },
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
          this.debouncedLoad();
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


.empty-state {
  padding-top: 24px;
}
</style>