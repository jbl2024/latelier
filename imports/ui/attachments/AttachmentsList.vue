<template>
  <div class="attachments-list">
    <v-list two-line subheader class="list">
      <slot v-if="!hideHeader" name="list-header">
        <v-subheader>
          {{ $t('attachments.attachments') }}
          <v-btn
            icon
            dark
            small
            color="primary"
            @click="addAttachment"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-subheader>
        <v-divider />
      </slot>
      <template v-for="attachment in attachments">
        <slot name="item" :attachment="attachment">
          <v-list-item :key="attachment._id" @click="goToLink(attachment)">
            <v-list-item-avatar :color="getIconStyles(attachment).color">
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
                  <!-- Related meetings -->
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
                        class="chip-link"
                        :to="{
                          name: 'meetings',
                          params: {
                            projectId: meeting.projectId,
                            meetingId: meeting._id
                          }
                        }"
                      >
                        {{ meeting.name }}
                      </router-link>
                    </v-chip>
                  </template>
                </v-chip-group>
              </v-list-item-subtitle>
            </v-list-item-content>

            <template v-if="!readOnly">
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
          </v-list-item>
        </slot>
      </template>
    </v-list>
  </div>
</template>
<script>
import AttachmentsMixin from "/imports/ui/mixins/AttachmentsMixin";

export default {
  mixins: [AttachmentsMixin],
  props: {
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
    meetings: {
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
      default: ""
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    searchInput: {
      get() {
        return this.search;
      },
      set(newSearch) {
        this.$emit("update:search", newSearch);
      }
    },
    selectedAttachments: {
      get() {
        return this.value;
      },
      set(selectedAttachments) {
        this.$emit("input", selectedAttachments);
      }
    },
    attachmentMeetings() {
      return function(attachment) {
        if (!this.meetings || !Array.isArray(this.meetings)) return [];
        return this.meetings.filter((meeting) => {
          const documentsIds = meeting.documents.map((doc) => doc.documentId);
          return documentsIds.includes(attachment._id);
        }).filter((m) => m);
      };
    }
  },
  methods: {
    goToLink(attachment) {
      window.open(this.link(attachment), "_blank");
    }
  }
};
</script>
<style lang="scss">
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
