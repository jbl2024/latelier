<template>
  <div v-if="hasAttachments">
    <!-- As list -->
    <v-list v-if="display === 'list'" two-line subheader class="list">
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
    <!-- As combobox -->
    <v-combobox
      v-else-if="display === 'combobox'"
      v-model="selectedAttachments"
      :items="attachments"
      small-chips
      outlined
      :hide-selected="hideSelected"
      :search-input.sync="searchInput"
      :label="label"
      hide-details="auto"
      :item-text="getAttachmentName"
      return-object
      multiple
    >
      <template v-slot:selection="{ attrs, item, parent, selected }">
        <v-chip
          v-if="item === Object(item)"
          v-bind="attrs"
          color="success"
          :input-value="selected"
          small
        >
          <span class="pr-2">
            {{ getAttachmentName(item) }}
          </span>
          <v-icon
            small
            @click="parent.selectItem(item)"
          >
            mdi-close
          </v-icon>
        </v-chip>
      </template>
      <template v-slot:no-data>
        <v-list-item>
          <span class="mr-2">
            Appuyer sur Entrée pour ajouter
          </span>
          <v-chip class="new-attachment" small>
            {{ `"${searchInput}"` }}
          </v-chip>
          <span class="ml-2">
            aux participants
          </span>
        </v-list-item>
      </template>
      <template v-slot:item="data">
        <template>
          <v-list-item-avatar>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ getAttachmentName(data.item) }}
            </v-list-item-title>
            <!-- Task link -->
            <v-list-item-subtitle v-if="hasTask(data.item)">
              <router-link
                class="link-subtitle"
                :to="{
                  name: 'project-task',
                  params: {
                    projectId: data.item.meta.projectId,
                    taskId: data.item.meta.taskId
                  }
                }"
              >
                {{ getTask(data.item).name }}
              </router-link>
            </v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </template>
    </v-combobox>
  </div>
</template>
<script>
import { Attachments } from "/imports/api/attachments/attachments.js";
import { Tasks } from "/imports/api/tasks/tasks.js";

export default {
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
    },
    display: {
      type: String,
      default: "list",
      validator: (display) => ["list", "combobox"].includes(display)
    },
    hideSelected: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    hasAttachments() {
      return this.attachments && this.attachments.length > 0;
    },
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
  },
  methods: {
    addAttachment() {
      this.$emit("add-attachment");
    },
    getAttachmentName(attachment) {
      return attachment.name;
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
            { attachmentId: attachment._id },
            (error) => {
              if (error) {
                this.$notifyError(error);
              }
            }
          );
        }
      });
    }
  }
};
</script>
