<template>

<div class="task-attachments">
    <md-field >
      <label>Cliquer pour ajouter un fichier</label>
      <md-file v-model="file" @md-change="onUpload" :disabled="isUploading"/>
    </md-field>

   <md-list>
      <md-list-item v-for="attachment in attachments" :key="attachment._id">
        <md-icon>description</md-icon>
        <span class="md-list-item-text">{{ attachment.name }}</span>

        <md-button class="md-icon-button md-list-action" @click="deleteAttachment(attachment)">
          <md-icon>delete</md-icon>
        </md-button>
      </md-list-item>
   </md-list>
   <div class="progress">
    <md-progress-spinner :md-diameter="30" :md-stroke="3" md-mode="indeterminate" v-show="isUploading"></md-progress-spinner>
   </div>


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
    onUpload(files) {
      var that = this;
      const upload = Attachments.insert(
        {
          file: files[0],
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