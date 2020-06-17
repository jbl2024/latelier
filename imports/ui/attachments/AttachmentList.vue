<template>
  <v-list v-if="attachments && attachments.length > 0" two-line subheader class="list">
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
    <v-list-item v-for="attachment in attachments" :key="attachment._id">
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
  </v-list>
</template>
<script>
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

export default {
  props: {
    attachments: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    addAttachment() {
      this.$emit("add-attachment");
    },
    link(attachment) {
      return Attachments.link(attachment);
    },
    hasTask(attachment) {
      return attachment?.meta?.taskId != null;
    },
    getTask(attachment) {
      return Tasks.findOne({ _id: attachment.meta.taskId });
    },
    deleteAttachment(attachment) {
      this.$confirm(this.$t("Delete attachment?"), {
        title: attachment.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "attachments.remove",
            {attachmentId: attachment._id},
            (error, result) => {
              if (error) {
                this.$notifyError(error);
              }
            }
          );
        }
      });
    }
  }
}
</script>