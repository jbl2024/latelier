<template>
  <div>
    <v-autocomplete
      v-model="selectedAttachments"
      :items="attachments"
      outlined
      chips
      small-chips
      multiple
      :search-input.sync="searchInput"
      :label="label"
      hide-details="auto"
      :item-value="getAttachmentId"
      :item-text="getAttachmentName"
      return-object
      :no-data-text="$t('attachments.noneFound')"
    >
      <template v-slot:selection="{ attrs, item, parent, selected }">
        <v-chip
          v-if="item === Object(item)"
          :key="getAttachmentId(item)"
          v-bind="attrs"
          :color="itemOptions.color"
          :dark="itemOptions.dark"
          :input-value="selected"
          small
        >
          <span class="pr-2">
            {{ getAttachmentName(item) }}
          </span>
          <v-icon
            small
            @click.stop="parent.selectItem(item)"
          >
            mdi-close
          </v-icon>
        </v-chip>
      </template>
      <!--
        <template v-slot:item="data">
          <v-list-item-avatar>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ getAttachmentName(data.item) }}
            </v-list-item-title>
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
        </template> -->
    </v-autocomplete>
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
    itemOptions: {
      type: Object,
      default() {
        return {
          color: "indigo",
          dark: true
        };
      }
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
