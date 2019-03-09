<template>

<div class="author-line">
    <template v-if="prefix">{{ prefix }}</template>
    <b>{{ formatUser(userId)}}</b> {{ formatDateDuration(date) }} ({{ formatDate(date) }}) <slot></slot>
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import usersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import moment from 'moment';
import 'moment/locale/fr'

export default {
  mixins: [usersMixin, DatesMixin],
  props: {
    userId: {
      type: String
    },
    date: {
      type: Date
    },
    prefix: {
      type: String
    }
  },
  data() {
    return {
    };
  }
};
</script>

<style scoped>

</style>