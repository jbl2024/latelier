<template>
  <div>
    <empty-state
      v-if="Array.isArray(attachments) && !attachments.length && emptyIllustration"
      :illustration="emptyIllustration"
      small
      :label="$t('attachments.none')"
    />
    <div
      v-else
      class="attachments-list"
    >
      <v-list
        :two-line="twoLine"
        subheader
        class="list"
      >
        <slot name="list-header" />
        <slot name="list-prepend" />
        <!-- Attachments -->
        <v-list-item-group
          v-model="selectedAttachmentsIds"
          :multiple="itemAction === 'select'"
          active-class="success--text"
        >
          <template v-for="attachment in attachments">
            <slot name="item" :attachment="attachment">
              <v-list-item
                :key="attachment._id"
                :value="attachment._id"
                @click="clickAttachment(attachment)"
              >
                <v-list-item-avatar
                  v-if="itemAction === 'select' && isSelected(attachment)"
                  color="success"
                >
                  <v-icon color="white">
                    mdi-check
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-avatar
                  v-else
                  :color="getIconStyles(attachment).color"
                >
                  <v-icon color="white">
                    {{ getIconStyles(attachment).icon }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content class="pointer">
                  <v-list-item-title>
                    {{ attachment.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="attachment.project">
                    <span class="grey--text text--darken-1 show-desktop">
                      <template v-if="attachment.organization">
                        {{ attachment.organization.name }} /
                      </template>
                      {{ attachment.project.name }}
                    </span>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle
                    v-if="hasTask(attachment) || attachmentMeetings(attachment).length"
                    @click.stop
                  >
                    <v-chip-group>
                      <!-- Related tasks -->
                      <v-chip
                        v-if="getTask(attachment)"
                        small
                        color="success"
                        dark
                      >
                        <v-icon small left>
                          mdi-format-list-bulleted
                        </v-icon>
                        <router-link
                          class="chip-link"
                          :to="{
                            name: 'project-task',
                            params: {
                              projectId: attachment.meta.projectId,
                              taskId: attachment.meta.taskId
                            }
                          }"
                        >
                          {{ getTask(attachment).name }}
                        </router-link>
                      </v-chip>
                      <template v-if="attachmentMeetings(attachment).length">
                        <v-chip
                          v-for="meeting in attachmentMeetings(attachment)"
                          :key="meeting._id"
                          small
                          :color="meeting.color"
                          dark
                        >
                          <v-icon small left>
                            mdi-calendar-star
                          </v-icon>
                          <router-link
                            v-if="meeting.to"
                            class="chip-link"
                            :to="meeting.to"
                          >
                            {{ meeting.name }}
                          </router-link>
                          <span v-else>
                            {{ meeting.name }}
                          </span>
                        </v-chip>
                      </template>
                    </v-chip-group>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <slot name="item-actions" :item="attachment">
                  <template v-if="canDelete">
                    <v-list-item-action>
                      <v-btn
                        icon
                        text
                        color="grey darken-1"
                        @click.stop="deleteAttachment(attachment)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </template>
                </slot>
              </v-list-item>
            </slot>
          </template>
        </v-list-item-group>
      </v-list>
      <div
        v-if="fetch && pagination.totalPages > 1"
        class="text-xs-center"
      >
        <v-pagination
          v-model="page"
          :total-visible="5"
          :length="pagination.totalPages"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Api from "/imports/api/Api";
import AttachmentsMixin from "/imports/ui/mixins/AttachmentsMixin";
import debounce from "lodash/debounce";

export default {
  mixins: [AttachmentsMixin],
  props: {
    emptyIllustration: {
      type: String,
      default: null
    },
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    attachments: {
      type: Array,
      default() {
        return [];
      }
    },
    search: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: null
    },
    fetch: {
      type: Boolean,
      default: false
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    twoLine: {
      type: Boolean,
      default: true
    },
    itemAction: {
      type: String,
      default: "link"
    },
    perPage: {
      type: Number,
      default: 10
    },
    params: {
      type: Object,
      default: null
    },
    withMeetings: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      page: 1,
      selectedAttachmentsIds: [],
      meetings: [],
      maxMeetingsPerRow: 5,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  computed: {
    selectedAttachments: {
      get() {
        return this.value;
      },
      set(selectedAttachments) {
        this.$emit("input", selectedAttachments);
      }
    },
    fetchParams() {
      return { name: this.search,
        page: this.page,
        perPage: this.perPage,
        ...this.params };
    },
    attachmentMeetings() {
      return (attachment) => {
        if (!this.meetings || !Array.isArray(this.meetings)) return [];
        const meetings = this.meetings.filter((meeting) => {
          const documentsIds = meeting.documents.map((doc) => doc.documentId);
          return documentsIds.includes(attachment._id);
        }).filter((m) => m);
        if (meetings.length > this.maxMeetingsPerRow) {
          const otherMeetings = meetings.slice(this.maxMeetingsPerRow);
          return meetings
            .filter((m, index) => index < this.maxMeetingsPerRow)
            .map(this.formatMeetingAsChip)
            .concat([this.formatOtherMeetingsAsChip(otherMeetings)]);
        }
        return meetings.map(this.formatMeetingAsChip);
      };
    }
  },
  watch: {
    selectedAttachments(attachments) {
      this.selectedAttachmentsIds = attachments.map((a) => a._id);
    },
    search: {
      handler: debounce(function() {
        this.fetchAttachments();
      }, 300)
    },
    page() {
      this.fetchAttachments();
    },
    attachments: {
      immediate: true,
      handler() {
        if (this.withMeetings) {
          this.fetchMeetings();
        }
      }
    },
    fetch: {
      immediate: true,
      handler(newVal) {
        if (newVal === true) {
          this.fetchAttachments();
        }
      }
    }
  },
  methods: {
    fetchAttachments() {
      if (!this.fetch) return;
      Api.call("attachments.find", this.fetchParams).then((result) => {
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = result.totalPages;
        const attachments = Array.isArray(result?.data) ? result.data : [];
        this.$emit("update:attachments", attachments);
        // this.attachmentCount = result.totalItems;
      }, (error) => {
        this.$notifyError(error);
      });
    },
    fetchMeetings() {
      if (!this.attachments || !Array.isArray(this.attachments)) return;
      const attachmentsIds = this.attachments.map(((a) => a._id));
      Api.call("meetings.findMeetings", {
        projectId: this.projectId,
        documentsIds: attachmentsIds
      }).then((result) => {
        this.meetings = Array.isArray(result?.data) ? result.data : [];
      }).catch((error) => this.$notifyError(error));
    },
    clickAttachment(attachment) {
      if (this.itemAction === "link") {
        this.goToLink(attachment);
      } else if (this.itemAction === "select") {
        this.selectAttachment(attachment);
      }
    },
    selectAttachment(attachment) {
      const index = this.getAttachmentIndex(attachment);
      if (index === -1) {
        this.selectedAttachments.push(attachment);
      } else {
        this.selectedAttachments.splice(index, 1);
      }
    },
    formatMeetingAsChip(meeting) {
      return {
        _id: meeting._id,
        color: meeting.color,
        to: {
          name: "meetings",
          params: {
            projectId: meeting.projectId,
            meetingId: meeting._id
          }
        },
        name: meeting.name
      };
    },
    formatOtherMeetingsAsChip(otherMeetings) {
      return {
        _id: "others",
        color: "indigo",
        name: ` +${otherMeetings.length} ${this.$t("meetings.meetings")}`
      };
    },
    getAttachmentIndex(attachment) {
      return this.selectedAttachments.findIndex((a) => a._id === attachment._id);
    },
    isSelected(attachment) {
      return this.getAttachmentIndex(attachment) !== -1;
    },
    goToLink(attachment) {
      window.open(this.link(attachment), "_blank");
    },
    addAttachment() {
      return this.$emit("add-attachment");
    }
  }
};
</script>
<style lang="scss" scoped>
  .empty-state {
    padding: 2rem;
  }

  .attachments-list .v-list {
    padding: 0;
    .chip-link,
    .link {
      text-decoration: none;
    }
    .chip-link {
      color: white;
    }
  }
</style>
