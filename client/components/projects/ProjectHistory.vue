<template>
  <div class="project-history">
    <v-dialog v-model="showDialog" :fullscreen="$vuetify.breakpoint.xsOnly" max-width="60%">
      <v-toolbar dark color="primary">
        <v-btn icon text @click="close()" v-shortkey="['esc']" @shortkey="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          Historique
        </v-toolbar-title>
      </v-toolbar>       
      <v-card>
        <v-card-text class="content">
          <v-progress-linear indeterminate v-if="loading"></v-progress-linear>

          <v-timeline :dense="$vuetify.breakpoint.xsOnly" clipped dense v-if="!loading"> 
            <v-timeline-item 
              v-for="item in history"
              :key="item._id"
              color="indigo"
              :small="$vuetify.breakpoint.xsOnly"
            >
             <span slot="opposite"></span>
              <v-card class="elevation-2">
                <v-card-text>
                  <div class="task-name">{{ item.properties.task.name }}</div>
                  <div>{{ $t(`history.${item.type}`) }} <span class="grey--text">{{ $t('dates.duration.by', { duration: formatDateDuration(item.createdAt), user: item.user}) }}</span></div>
                </v-card-text>
              </v-card>

            </v-timeline-item>

          </v-timeline>
        </v-card-text>
        <div class="text-xs-center">
          <v-pagination v-if="pagination.totalPages > 0" v-model="page" :length="pagination.totalPages"></v-pagination>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="close()">{{ this.$t('Close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    projectId: String
  },
  watch: {
    page(page) {
      this.refresh();
    },
  },
  data () {
    return {
      showDialog: false,
      history: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    }
  },
  methods: {
    open () {
      this.refresh();
      this.showDialog = true;
    },

    close () {
      this.showDialog = false;
    },

    refresh () {
      this.loading = true;
      Meteor.call('projects.getHistory', {projectId: this.projectId, page: this.page}, (error, result) => {
        this.loading = false;
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = this.calculateTotalPages();
        this.history = result.data;
      })
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
    }

  }
}
</script>

<style scoped>
.content {
  overflow-y: auto;
  max-height: 450px;
  min-height: 450px;
}

.task-name {
  font-weight: bold;
}


</style>