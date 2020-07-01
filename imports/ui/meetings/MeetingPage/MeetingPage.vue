<template>
  <div class="meeting-page">
    <!-- Edit existing meeting -->
    <meeting-edit
      ref="editMeeting"
      :key="currentMeeting ? currentMeeting._id : null"
      :is-shown.sync="showEditMeeting"
      :project-id="projectId"
      :meeting="currentMeeting"
      :types="meetingTypes"
      @created="fetch"
      @updated="fetch"
      @removed="fetch"
    />
    <meeting-detail-card
      v-if="currentMeeting"
      class="meeting-card"
      :meeting="currentMeeting"
      :project="currentProject"
      @edit-meeting="showEditMeeting = true"
    />
  </div>
</template>
<script>
import { Projects } from "/imports/api/projects/projects.js";
import { mapState, mapActions } from "vuex";
import MeetingDetailCard from "/imports/ui/meetings/MeetingDetailCard";
import MeetingEdit from "/imports/ui/meetings/Meeting/MeetingEdit";

export default {
  components: {
    MeetingEdit,
    MeetingDetailCard
  },
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
  data() {
    return {
      showEditMeeting: false
    };
  },
  computed: {
    ...mapState(["currentUser"]),
    ...mapState("project", ["currentProject"]),
    ...mapState("meeting", ["currentMeeting", "meetingTypes"])
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
    await this.$store.dispatch("meeting/fetchMeetingTypes");
    await this.$store.dispatch("meeting/fetchMeetingRoles");
    await this.fetch();
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  methods: {
    ...mapActions("meeting", ["fetchCurrentMeeting"]),
    async fetch() {
      try {
        await this.fetchCurrentMeeting({
          meetingId: this.meetingId
        });
      } catch (error) {
        this.$notifyError(error);
      }
    }
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
