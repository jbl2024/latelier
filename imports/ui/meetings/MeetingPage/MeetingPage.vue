<template>
  <div class="meeting-page" :style="getBackgroundUrl(currentUser)">
    <template v-if="currentMeeting">
      <meeting-detail-card class="meeting-card" :meeting="currentMeeting" />
    </template>
  </div>
</template>
<script>
import { Projects } from "/imports/api/projects/projects.js";
import BackgroundMixin from "/imports/ui/mixins/BackgroundMixin.js";
import { mapState, mapActions } from "vuex";
import MeetingDetailCard from "/imports/ui/meetings/MeetingDetailCard";

export default {
  components: {
    MeetingDetailCard
  },
  mixins: [BackgroundMixin],
  props: {
    projectId: {
      type: String,
      default: null
    },
    meetingId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProject"]),
    ...mapState("meeting", ["currentMeeting"])
  },
  meteor: {
    $subscribe: {
      project() {
        return [this.projectId];
      }
    },
    project() {
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
    }
  },
  watch: {
    projectId() {
      this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    }
  },
  async mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    await this.fetchCurrentMeeting({
      meetingId: this.meetingId
    });
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
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
  }
</style>
