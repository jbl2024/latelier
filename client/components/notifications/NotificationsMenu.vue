<template>
  <div class="notifications-menu">
    <v-card>
      <template v-if="$subReady.notifications">
        <empty-state
          xs
          class="empty-state"
          v-if="notifications.length == 0"
          :description="$t('No notifications') "
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
import { Notifications } from "/imports/api/notifications/notifications.js";

export default {
  data() {
    return {};
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