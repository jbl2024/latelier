<template>
  <v-avatar
    :size="size"
    :class="cssClasses"
    :title="title"
  >
    <template v-if="avatar">
      <v-img :src="avatar" :alt="letters" />
    </template>
    <template v-else>
      <span>{{ letters }}</span>
    </template>
  </v-avatar>
</template>

<script>
import usersMixin from "/imports/ui/mixins/UsersMixin.js";

import "moment/locale/fr";

export default {
  mixins: [usersMixin],
  props: {
    cssClasses: {
      type: [Object, Array, String],
      default: "grey lighten-1"
    },
    avatar: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    letters: {
      type: String,
      default: "NA"
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
    }
  }
};
</script>
