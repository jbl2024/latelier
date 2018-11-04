<template>

<div class="task-attachments">
  <input type="file" v-if="!isUploading" @change="onUpload" :disabled="isUploading"/>
  <v-progress-linear indeterminate v-show="isUploading"></v-progress-linear>
  <v-list>
    <v-list-tile v-for="attachment in attachments" :key="attachment._id">
      <v-list-tile-avatar>
        <v-icon>description</v-icon>
      </v-list-tile-avatar>            

      <v-list-tile-content class="pointer">
        <v-list-tile-title>
          <a :href="link(attachment)"  target="_blank">{{ attachment.name }}</a>          
        </v-list-tile-title>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-btn icon ripple @click.stop="deleteAttachment(attachment)">
          <v-icon>delete</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list> 
</div>

</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Attachments } from "/imports/api/attachments/attachments";

import moment from "moment";
import "moment/locale/fr";

export default {
  name: "task-attachments",
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      file: null,
      isUploading: false
    };
  },
  methods: {
    onUpload(e) {
      var file = e.target.files[0];
      var that = this;
      const upload = Attachments.insert(
        {
          file: file,
          streams: "dynamic",
          chunkSize: "dynamic",
          meta: {
            projectId: this.task.projectId,
            taskId: this.task._id,
            createdBy: Meteor.userId()
          }
        },
        false
      );

      upload.on("start", function() {
        that.isUploading = true;
      });

      upload.on("end", function(error, fileObj) {
        that.isUploading = false;
        if (error) {
          alert("Error during upload: " + error);
        } else {
          Meteor.call('tasks.track', {
            type: 'tasks.addAttachment',
            taskId: that.task._id,
          });

          that.file = null;
        }
      });

      upload.start();
    },

    deleteAttachment (attachment) {
      Meteor.call('attachments.remove', attachment._id);
      Meteor.call('tasks.track', {
        type: 'tasks.removeAttachment',
        taskId: this.task._id,
      });
    },

    link (attachment) {
      return Attachments.link(attachment);
    }
  },
  meteor: {
    attachments: {
      params () {
        return {
          task: this.task
        };
      },
      update ({task}) {
        return Attachments.find({'meta.taskId': this.task._id});
      }
    }
  }
};
</script>

<style scoped>

.progress {
  text-align: center;
}
</style>