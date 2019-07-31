<template>
  <div class="notifications-menu">
    <v-card>
      <template v-if="$subReady.notifications">
        <empty-state
          xs
          class="empty-state"
          v-if="notifications.length == 0"
          :description="$t('No notification') "
          illustration="notifications_empty"
        ></empty-state>

        <notification-list :notifications="notifications"></notification-list>
      </template>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          flat
          :to="{ name: 'notification-center-page' }"
        >{{ $t('Open notification center') }}</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import { Notifications } from "/imports/api/notifications/notifications.js";

export default {
  created() {
    this.debouncedShown = debounce(val => {
      const notificationIds = [];
      this.notifications.map(notification => {
        if (!notification.read) notificationIds.push(notification._id);
      });
      Meteor.call("notifications.markAsRead", { notificationIds: notificationIds});
    }, 2000);
  },
  props: {
    shown: Boolean,
  },
  data() {
    return {};
  },
  watch: {
    shown(shown) {
      if (shown) {
        this.debouncedShown(true);
      } else {
        this.debouncedShown.cancel();
      }
    }
  },

  meteor: {
    $subscribe: {
      notifications: function() {
        return [];
      }
    },

    notifications() {
      return Notifications.find({}, { sort: { createdAt: -1 } });
    }
  },
  methods: {}
};
</script>

<style scoped>
.notifications-menu {
  width: 500px;
}

.empty-state {
  padding-top: 24px;
}
</style>