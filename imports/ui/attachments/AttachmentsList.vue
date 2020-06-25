<template>
  <div>
    <v-list two-line subheader class="list">
      <slot name="list-header">
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
      </slot>
      <template v-for="attachment in attachments">
        <slot name="item" :attachment="attachment">
          <v-list-item :key="attachment._id">
            <v-list-item-avatar>
              <v-icon>mdi-file-document</v-icon>
            </v-list-item-avatar>

            <v-list-item-content class="pointer">
              <v-list-item-title>
                <a class="link" :href="link(attachment)" target="_blank">{{
                  attachment.name
                }}</a>
              </v-list-item-title>
              <!-- Task link -->
              <v-list-item-subtitle v-if="hasTask(attachment)">
                <router-link
                  class="link-subtitle"
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
              </v-list-item-subtitle>
            </v-list-item-content>

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
    search: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
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
    }
  }
};
</script>
