<template>

<div class="task-attachments">
  <input type="file" v-if="!isUploading" @change="onUpload" :disabled="isUploading"/>
  
  <v-progress-linear indeterminate v-show="isUploading"></v-progress-linear>

   <md-list>
      <md-list-item v-for="attachment in attachments" :key="attachment._id">
        <md-icon>description</md-icon>
        <a :href="link(attachment)"  target="_blank" class="md-list-item-text">{{ attachment.name }}</a>

        <md-button class="md-icon-button md-list-action" @click.stop="deleteAttachment(attachment)">
          <md-icon>delete</md-icon>
        </md-button>
      </md-list-item>
   </md-list>
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
          that.file = null;
        }
      });

      upload.start();
    },

    deleteAttachment (attachment) {
      Meteor.call('attachments.remove', attachment._id);
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