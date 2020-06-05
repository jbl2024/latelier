<template>
  <v-list-item
    v-if="meeting"
    @click="openMeeting(meeting)"
    class="meeting-drawer-list-item"
  >
    <v-list-item-content>
      <v-list-item-title class="no-wrap">
        <div class="meeting-name">
          {{ meeting.name }}
        </div>
      </v-list-item-title>
      <v-list-item-subtitle>
        <span class="grey--text text--darken-1 show-desktop">
          {{ meeting.project.name }}
        </span>
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import UsersMixin from "/imports/ui/mixins/UsersMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import { colors } from "/imports/colors.js";

export default {
  name: "MeetingDrawerListItem",
  props: {
    meeting: {
      type: Object,
      default: null
    }
  },
  methods: {
    openMeeting(meeting) {
      alert("Meeting opened!");
    }
  }
};
</script>

<style lang="scss">
.meeting-drawer-list-item {
  .no-wrap {
    white-space: normal;
  }
  .meeting-name {
    margin-bottom: 4px;
  }
}
</style>
