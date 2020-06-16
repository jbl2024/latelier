<template>
  <v-list v-show="documents.length > 0" two-line subheader class="list">
    <v-list-item v-for="document in documents" :key="document._id">
      <v-list-item-avatar>
        <v-checkbox
          :key="`checkbox-${document._id}`"
          v-model="selectedDocuments"
          :value="document"
        />
      </v-list-item-avatar>
      <v-list-item-content class="pointer">
        <v-list-item-title>
          <v-icon class="mr-2">
            mdi-file-document
          </v-icon>
          <a class="link" :href="link(document)" target="_blank">
            {{ document.name }}
          </a>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script>
import { Attachments } from "/imports/api/attachments/attachments.js";

export default {
  props: {
    documents: {
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
    }
  },
  data() {
    return {
      checked: []
    };
  },
  computed: {
    selectedDocuments: {
      get() {
        return this.value;
      },
      set(newDocuments) {
        this.$emit("input", newDocuments);
      }
    }
  },
  methods: {
    isSelectedDocument(document) {
      const foundSelectedDocumentIndex = this.selectedDocuments.findIndex((selectedDocument) => selectedDocument._id === document._id);
      return foundSelectedDocumentIndex !== -1;
    },
    link(document) {
      return Attachments.link(document);
    }
  }
};
</script>
