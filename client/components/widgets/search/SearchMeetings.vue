<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate absolute top />
    <meeting-list
      :meetings="meetings"
      empty-illustration="empty"
      @select="onSelectMeeting"
    />
    <div class="text-xs-center">
      <v-pagination
        v-if="pagination.totalPages > 1"
        v-model="page"
        :total-visible="5"
        :length="pagination.totalPages"
      />
    </div>
  </div>
</template>

<script>
import MeetingList from "/imports/ui/meetings/MeetingList";

export default {
  components: {
    MeetingList
  },
  props: {
    filter: {
      type: String,
      default: ""
    },
    projectId: {
      type: String,
      default: null
    },
    organizationId: {
      type: String,
      default: null
    },
    autoSearch: {
      type: Boolean,
      default: false
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
    page() {
      this.find();
    },
    filter: {
      immediate: true,
      handler() {
        if (this.page !== 1) {
          this.page = 1;
        } else {
          this.find();
        }
      }
    }
  },
  methods: {
    find() {
      if (this.autoSearch === false && (!this.filter || !this.filter.length === 0)) return;
      this.loading = true;
      Meteor.call(
        "search.findMeetings",
        {
          name: this.filter,
          projectId: this.projectId,
          organizationId: this.organizationId,
          page: this.page
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
