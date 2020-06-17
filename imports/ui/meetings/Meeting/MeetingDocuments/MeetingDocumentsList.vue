<template>
  <div
    v-if="documents && documents.length > 0"
    class="meeting-documents-list"
  >
    <v-list 
      two-line
      subheader
      class="list"
    >
      <v-list-item v-for="document in documentsList" :key="document._id">
        <v-list-item-action>
          <v-checkbox
            :key="`checkbox-${document._id}`"
            v-model="selectedDocuments"
            :value="document._id"
          />
        </v-list-item-action>
        <v-list-item-content class="pointer">
          <v-list-item-title>
            <v-icon class="mr-2">
              mdi-file-document
            </v-icon>
            <a class="link" :href="document.link" target="_blank">
              {{ document.name }}
            </a>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-pagination
        v-if="pagination.totalPages > 1"
        v-model="page"
        :length="pagination.totalPages"
      />
  </div>
  <div v-else>
    Aucun document correspondant aux critères.
  </div>
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
    },
    page: {
      type: Number,
      default: 1
    },
    pagination: {
      type: Object,
      default: null
    }
  },
  computed: {
    documentsList() {
      return this.documents.map((document) => {
        return {
          _id: document._id,
          name: document.name,
          link: Attachments.link(document)
        };
      });
    },
    selectedDocuments: {
      get() {
        return this.value;
      },
      set(newDocuments) {
        this.$emit("input", newDocuments);
      }
    }
  }
};
</script>
