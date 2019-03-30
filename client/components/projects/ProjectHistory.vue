<template>
  <div class="project-history">
    <v-dialog v-model="showDialog" :fullscreen="$vuetify.breakpoint.xsOnly" max-width="60%">
      <v-toolbar dark color="primary">
        <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
          <v-icon>close</v-icon>
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
                  <div>{{ item.properties.task.name }}</div>
                  <div class="grey--text">{{ $t(`history.${item.type}`) }} {{ formatDateDuration(item.createdAt) }} par {{ item.user }}</div>
                </v-card-text>
              </v-card>

            </v-timeline-item>

          </v-timeline>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="close()">Fermer</v-btn>
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
  data () {
    return {
      showDialog: false,
      history: [],
      loading: true
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
      Meteor.call('projects.getHistory', {projectId: this.projectId}, (error, result) => {
        this.loading = false;
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.history = result.data;
      })
    }

  }
}
</script>

<style scoped>
.content {
  overflow-y: auto;
  max-height: 500px;
}

</style>