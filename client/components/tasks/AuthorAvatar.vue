<template>
  <v-avatar :size="size" :class="isOnline(userId)">
    <span>{{ formatUserLetters(userId) }}</span>
  </v-avatar>
</template>

<script>
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

import moment from "moment";
import "moment/locale/fr";

export default {
  mixins: [usersMixin],
  props: {
    userId: {
      type: String
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    size () {
      if (this.small) {
        return 30;
      }
      return 40;
    }
  }

};
</script>
