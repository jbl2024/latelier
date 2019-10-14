<template>
  <div class="select-photo">
    <v-dialog
      :value="active"
      @input="$emit('update:active')"
      max-width="820"
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card class="flex-container">
        <v-card-title class="headline">{{ $t('Select a a photo') }}</v-card-title>

        <div class="flex0 search">
          <v-text-field
            :label="$t('Search') + '...'"
            single-line
            append-icon="mdi-magnify"
            clearable
            v-on:input="debouncedFilter"
          ></v-text-field>
          <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
        </div>

        <v-card-text class="flex1">
          <v-container fluid>
            <v-row>
              <v-col v-for="photo in photos" :key="photo.id" class="d-flex child-flex" cols="3">
                <v-hover>
                  <template v-slot:default="{ hover }">
                    <v-card flat tile class="d-flex">
                      <v-img :src="photo.urls.thumb" aspect-ratio="1" class="grey lighten-2">

                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>

                      <v-fade-transition>
                        <v-overlay v-if="hover" absolute color="#036358">
                          <div>By john doe</div>
                          <v-btn>{{ $t('Choose') }}</v-btn>
                        </v-overlay>
                      </v-fade-transition>
                    </v-card>
                  </template>
                </v-hover>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <div class="flex0">
          <div class="text-xs-center">
            <v-pagination
              v-if="active && pagination.totalPages > 1"
              v-model="page"
              :total-visible="5"
              :length="pagination.totalPages"
            ></v-pagination>
          </div>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closeDialog">{{ $t('Cancel') }}</v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import debounce from "lodash/debounce";

export default {
  props: {
    active: Boolean
  },
  created() {
    this.debouncedFilter = debounce(val => {
      this.search = val;
    }, 800);
  },
  data() {
    return {
      search: "",
      debouncedFilter: null,
      photos: [],
      loading: false,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  watch: {
    active(active) {
      if (active) {
        this.page = 1;
      }
    },
    search() {
      if (this.page > 1) {
        this.page = 1;
      } else {
        this.refresh();
      }
    },
    page(page) {
      this.refresh();
    }
  },

  methods: {
    closeDialog() {
      this.$emit("update:active", false);
    },

    refresh() {
      if (!this.search || this.search.length === 0) return;

      this.loading = true;
      Meteor.call(
        "backgrounds.findUnsplash",
        { name: this.search, page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.photos = result.data;
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    },

    selectProject(photo) {
      this.$emit("update:active", false);
      this.$emit("select", photo);
    }
  }
};
</script>

<style scoped>
.content {
  overflow-y: scroll;
}

.search {
  padding-left: 48px;
  padding-right: 48px;
}

@media (max-width: 600px) {
  .search {
    padding-left: 12px;
    padding-right: 12px;
  }
}

@media (min-width: 601px) {
  .flex-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    min-height: 360px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1;
    overflow-y: scroll;
  }
}
</style>