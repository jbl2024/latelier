<template>
  <v-avatar
    :size="size"
    :class="isOnline(userId)"
    :title="getEmailForUser(userId)"
  >
    <template v-if="avatar">
      <img :src="avatar" :alt="formatUserLetters(userId)">
    </template>
    <template v-if="!avatar">
      <span>{{ formatUserLetters(userId) }}</span>
    </template>
  </v-avatar>
</template>

<script>
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

import "moment/locale/fr";

export default {
  mixins: [usersMixin],
  props: {
    userId: {
      type: [String, Object],
      default: null
    },
    small: {
      type: Boolean,
      default: false
    },
    xsmall: {
      type: Boolean,
      default: false
    },
    big: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    size() {
      if (this.big) {
        return 128;
      }
      if (this.small) {
        return 30;
      }
      if (this.xsmall) {
        return 24;
      }
      return 40;
    },
    avatar() {
      return this.getAvatarForUser(this.userId);
    }
  }
};
</script>
