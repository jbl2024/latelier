<template>
  <div>
    <!-- List -->
    <attachment-list
      v-if="display === 'list'"
      :search.sync="searchInput"
      :label="label"
      :attachments="attachments"
      @add-attachment="addAttachment"
    />
    <!-- Autocomplete -->
    <attachments-autocomplete
      v-else-if="display === 'autocomplete'"
      v-model="selectedAttachments"
      :search.sync="searchInput"
      :label="label"
      :attachments="attachments"
    />
  </div>
</template>
<script>
import AttachmentsAutocomplete from "./AttachmentsAutocomplete";
import AttachmentList from "./AttachmentsList";

export default {
  components: {
    AttachmentsAutocomplete,
    AttachmentList
  },
  props: {
    display: {
      type: String,
      default: "list",
      validator: (display) => ["list", "autocomplete"].includes(display)
    },
    attachments: {
      type: Array,
      default() {
        return [];
      }
    },
    value: {
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
    }
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
    searchInput: {
      get() {
        return this.search;
      },
      set(newSearch) {
        this.$emit("update:search", newSearch);
      }
    }
  },
  methods: {
    addAttachment() {
      return this.$emit("add-attachment");
    }
  }
};
</script>
