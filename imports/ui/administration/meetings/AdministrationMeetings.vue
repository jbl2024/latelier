<template>
  <div class="meetings">
    <v-card class="center">
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" sm="12" lg="10">
              <v-text-field
                :label="$t('Search') + '...'"
                single-line
                append-icon="mdi-magnify"
                clearable
                @input="debouncedFilter"
              />
            </v-col>
            <v-col sm="6" md="6" lg="2">
              <v-switch
                v-model="filterDeleted"
                color="accent"
                :label="$t('Deleted')"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-list subheader>
                <v-subheader inset>
                  {{ pagination.totalItems }} {{ $t("meetings.meetings") }}
                </v-subheader>
                <template v-for="meeting in meetings">
                  <v-list-item :key="meeting._id" @click="openMeeting(meeting)">
                    <v-list-item-avatar :color="getColor(meeting)" />
                    <v-list-item-content>
                      <v-list-item-title :class="getClass(meeting)">
                        {{ meeting.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <author-line
                          :user-id="meeting.createdBy"
                          :date="meeting.createdAt"
                          class="author"
                          :prefix="$t('Created by')"
                        />
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action v-if="meeting.deleted">
                      <v-btn color="red" icon ripple @click.stop="deleteForever(meeting)">
                        <v-icon>mdi-delete-forever</v-icon>
                      </v-btn>
                    </v-list-item-action>
                    <v-list-item-action v-if="meeting.deleted">
                      <v-btn color="blue" icon ripple @click.stop="restoreMeeting(meeting)">
                        <v-icon>mdi-delete-restore</v-icon>
                      </v-btn>
                    </v-list-item-action>
                    <v-list-item-action v-if="!meeting.deleted">
                      <v-btn icon ripple @click.stop="removeMeeting(meeting)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="text-xs-center">
                <v-pagination
                  v-if="pagination.totalPages > 0"
                  v-model="page"
                  :length="pagination.totalPages"
                />
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";

import debounce from "lodash/debounce";

export default {
  name: "AdministrationMeetings",
  data() {
    return {
      search: "",
      debouncedFilter: null,
      meetings: [],
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      },
      filterDeleted: false
    };
  },
  watch: {
    page() {
      this.refresh();
    },
    filterDeleted() {
      if (this.page !== 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    }
  },
  mounted() {
    this.refresh();
  },
  created() {
    this.debouncedFilter = debounce((val) => {
      this.search = val;
    }, 400);
  },
  methods: {
    refresh() {
      Meteor.call(
        "admin.findMeetings",
        {
          page: this.page,
          filter: this.search,
          isDeleted: this.filterDeleted
        },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = result.totalPages;
          this.meetings = result.data;
        }
      );
    },
    removeMeeting(meeting) {
      this.$confirm(this.$t("meetings.meetingDelete?"), {
        title: meeting.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "meetings.remove",
            { meetingId: meeting._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("meetings.meetingDeleted"));
              this.refresh();
            }
          );
        }
      });
    },
    deleteForever(meeting) {
      this.$confirm(this.$t("Delete forever"), {
        title: meeting.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "meetings.deleteForever",
            { meetingId: meeting._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
                return;
              }
              this.$notify(this.$t("meetings.meetingDeleted"));
              this.refresh();
            }
          );
        }
      });
    },

    restoreMeeting(meeting) {
      Meteor.call(
        "meetings.restore",
        { meetingId: meeting._id },
        (error) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.$notify(this.$t("meetings.meetingRestored"));
          this.refresh();
        }
      );
    },
    async openMeeting(meeting) {
      await this.$router.push({
        name: "meetings",
        params: {
          meetingId: meeting._id,
          projectId: meeting.projectId
        }
      });
    },
    getClass(meeting) {
      if (meeting.deleted) {
        return "deleted";
      }
      return "";
    },
    getColor(meeting) {
      return meeting.color;
    }
  }
};
</script>

<style scoped>
.meetings {
  background-color: #e5e5e5;
}

.deleted {
  text-decoration: line-through;
}

.center {
  max-width: 800px;
  margin: 0 auto;
  margin-top: 24px;
}
</style>
