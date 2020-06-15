<template>
  <v-list-item
    v-if="meeting"
    class="meeting-drawer-list-item"
    @click="openMeeting(meeting)"
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
      alert(`${meeting.name} meeting opened!`);
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
