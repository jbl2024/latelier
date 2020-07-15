<template>
  <div class="meeting-page-list">
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <meeting-list
        :meetings="meetings"
        empty-illustration="empty"
        @select="onSelectMeeting"
      />
      <div class="text-xs-center">
        <v-pagination
          v-if="pagination.totalPages > 0"
          v-model="page"
          :total-visible="5"
          :length="pagination.totalPages"
        />
      </div>
    </template>
  </div>
</template>

<script>
import MeetingList from "/imports/ui/meetings/MeetingList";
import moment from "moment";

export default {
  components: {
    MeetingList
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      meetings: [],
      meetingCount: 0,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  watch: {
    page: {
      immediate: true,
      handler() {
        this.find();
      }
    }
  },
  methods: {
    find() {
      this.loading = true;
      Meteor.call(
        "meetings.findMeetings",
        {
          projectId: this.projectId,
          organizationId: this.organizationId,
          page: this.page,
          dates: [
            { start: moment().format("YYYY-MM-DD HH:mm:00") }
          ]
        },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPages;

          this.meetings = Array.isArray(result?.data) ? result.data : [];
          this.meetingCount = result.totalItems;
          this.$emit("update:meeting-count", this.meetingCount);
        }
      );
    },

    onSelectMeeting(meeting) {
      this.$emit("select", meeting);
    }
  }
};
</script>
