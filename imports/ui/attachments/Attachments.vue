<template>
  <div>
    <empty-state
      v-if="Array.isArray(attachments) && !attachments.length && emptyIllustration"
      :illustration="emptyIllustration"
      small
      :label="$t('attachments.none')"
    />
    <!-- List -->
    <attachment-list
      v-else-if="display === 'list'"
      :search.sync="searchInput"
      :label="label"
      :attachments="attachments"
      :meetings="meetings"
      :hide-header="hideHeader"
      :read-only="readOnly"
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
    meetings: {
      type: Array,
      default() {
        return [];
      }
    },
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
    search: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: null
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
<style scoped>
  .empty-state {
    padding: 2rem;
  }
</style>
