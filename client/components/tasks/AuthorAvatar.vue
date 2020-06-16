<template>
  <v-avatar
    :size="size"
    :class="isOnline(userId)"
    :title="computedTitle"
  >
    <template v-if="avatar">
      <v-img :src="avatar" :alt="computedUserLetters" />
    </template>
    <template v-if="!avatar">
      <span>{{ computedUserLetters }}</span>
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
    title: {
      type: String,
      default: null
    },
    userLetters: {
      type: String,
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
    computedUserLetters() {
      if (this.userLetters !== null) return this.userLetters;
      return this.formatUserLetters(this.userId);
    },
    computedTitle() {
      if (this.title) return this.title;
      return this.getEmailForUser(this.userId);
    },
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
