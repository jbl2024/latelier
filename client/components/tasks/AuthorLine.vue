<template>
  <div class="author-line">
    <template v-if="prefix">
      {{ prefix }}
    </template>
    <b>{{ formatUser(userId) }}</b>
    <template v-if="date">
      {{ formatDateDuration(date) }} ({{ formatDate(date) }})
    </template>
    <slot />
  </div>
</template>

<script>
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import "moment/locale/fr";

export default {
  mixins: [usersMixin, DatesMixin],
  props: {
    userId: {
      type: String,
      default: ""
    },
    date: {
      type: Date,
      default: null
    },
    prefix: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  }
};
</script>

<style scoped></style>
