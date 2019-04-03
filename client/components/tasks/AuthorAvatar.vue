<template>
  <v-avatar size="40" :class="isOnline(userId)">
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
    }
  },
  methods: {
  }
};
</script>
