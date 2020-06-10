<template>
  <div class="meeting-page" :style="getBackgroundUrl(currentUser)">
    <div>
      <meeting-page-toolbar
        :flat="true"
      />
      <pre>
        {{ currentMeeting }}
      </pre>
    </div>
  </div>
</template>
<script>
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState, mapActions } from "vuex";
import MeetingPageToolbar from "/imports/ui/meetings/MeetingPage/MeetingPageToolbar";

export default {
  components: {
    MeetingPageToolbar
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
  methods: {
    ...mapActions("meeting", ["fetchCurrentMeeting"])
  },
  async mounted() {
    await this.fetchCurrentMeeting({
      meetingId: this.meetingId
    });
  }
}
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
  }
</style>