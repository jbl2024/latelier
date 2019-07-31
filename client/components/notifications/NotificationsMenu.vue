<template>
  <div class="notifications-menu">
    <template v-if="$subReady.notifications">
      <notification-list :notifications="notifications" show-notification-center-link></notification-list>
    </template>
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
      return Notifications.find();
    }
  },
  methods: {}
};
</script>

<style scoped>
</style>