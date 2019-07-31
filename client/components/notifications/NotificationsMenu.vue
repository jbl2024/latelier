<template>
  <div class="notifications-menu">
    <v-card>
      <template v-if="$subReady.notifications">
        <notification-list :notifications="notifications"></notification-list>
      </template>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          flat
          :to="{ name: 'notification-center-page' }"
        >{{ $t('Open notification center') }}</v-btn>
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
</style>