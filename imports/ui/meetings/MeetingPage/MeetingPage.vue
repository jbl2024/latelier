<template>
  <div class="meeting-page">
    <!-- Edit existing meeting -->
    <meeting-edit
      ref="editMeeting"
      :key="currentMeeting ? currentMeeting._id : null"
      :is-shown.sync="showEditMeeting"
      :project-id="projectId"
      :meeting="currentMeeting"
      @created="refresh"
      @updated="refresh"
      @removed="refresh"
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
import { mapState } from "vuex";
import MeetingDetailCard from "/imports/ui/meetings/MeetingDetailCard";
import MeetingEdit from "/imports/ui/meetings/Meeting/MeetingEdit";
import Api from "/imports/ui/api/Api";


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
      showEditMeeting: false,
      currentMeeting: null
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
  mounted() {
    this.$store.dispatch("project/setCurrentProjectId", this.projectId);
    this.refresh();
  },
  beforeDestroy() {
    this.$store.dispatch("project/setCurrentProjectId", null);
  },
  methods: {
    refresh() {
      Api.call("meetings.get", {
        meetingId: this.meetingId
      }).then((meet) => {
        this.currentMeeting = meet;
      }).catch((error) => {
        this.$notifyError(error);
      });
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
