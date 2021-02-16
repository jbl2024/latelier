<template>
  <div v-if="$subReady.meeting" class="meeting-page">
    <!-- Edit existing meeting -->
    <meeting-edit
      ref="editMeeting"
      :key="currentMeeting ? currentMeeting._id : null"
      :is-shown.sync="showEditMeeting"
      :project="currentProject"
      :meeting="currentMeeting"
      @removed="onRemove"
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
import { Meetings } from "/imports/api/meetings/meetings.js";
import { mapState } from "vuex";
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
    ...mapState("project", ["currentProject"])
  },
  meteor: {
    $subscribe: {
      project() {
        return [this.projectId];
      },
      meeting() {
        return [this.meetingId];
      }
    },
    project() {
      const project = Projects.findOne();
      if (project) {
        this.$store.dispatch("project/setCurrentProject", project);
      }
    },

    currentMeeting: {
      params() {
        return {
          id: this.meetingId
        };
      },
      update({ id }) {
        return Meetings.findOne({ _id: id });
      }
    }
  },
  watch: {
    projectId() {
      this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    }
  },
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  methods: {
    goToMeetings() {
      this.$router.push({
        name: "project-meetings",
        params: { projectId: this.projectId }
      });
    },
    onRemove() {
      this.$notify(this.$t("meetings.meetingDeleted"));
      this.goToMeetings();
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
