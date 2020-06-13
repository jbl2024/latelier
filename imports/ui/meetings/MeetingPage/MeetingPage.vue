<template>
  <div class="meeting-page" :style="getBackgroundUrl(currentUser)">
    <div v-if="currentMeeting">
      <meeting-detail-card class="meeting-card" :meeting="currentMeeting" />
    </div>
  </div>
</template>
<script>
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState, mapActions } from "vuex";
import MeetingDetailCard from "/imports/ui/meetings/MeetingDetailCard";

export default {
  components: {
    MeetingDetailCard
  },
  mixins: [BackgroundMixin],
  props: {
    meetingId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("meeting", ["currentMeeting"])
  },
  async mounted() {
    await this.fetchCurrentMeeting({
      meetingId: this.meetingId
    });
  },
  methods: {
    ...mapActions("meeting", ["fetchCurrentMeeting"])
  }
};
</script>
<style lang="scss">
  .meeting-page {
    display: flex;
    min-height: 0;
    height: 100%;
    flex-direction: column;
    position: relative;
    flex: 1;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    background-attachment: fixed;

    .meeting-card {
      margin: 2rem;
    }
  }
</style>
