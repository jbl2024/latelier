<template>

<div class="task-attachments">
    <md-field v-show="!isUploading">
      <label>Single</label>
      <md-file v-model="file" @md-change="onUpload"/>
    </md-field>
    <md-progress-spinner md-mode="indeterminate" v-show="isUploading"></md-progress-spinner>

</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import { Attachments } from "/imports/api/attachments/attachments";

import moment from 'moment';
import 'moment/locale/fr'

export default {
  name: 'task-attachments',
  props: {
    task: {
      type: Object,
    }
  },
  data() {
    return {
      file: null,
      isUploading: false
    };
  },
  methods: {
    onUpload (files) {
      var that = this;
      const upload = Attachments.insert({
        file: files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic',
        meta: {
          projectId: this.task.projectId,
          taskId: this.task._id,
          createdBy: Meteor.userId()
        }
      }, false);

      upload.on('start', function () {
        that.isUploading = true;
      });

      upload.on('end', function (error, fileObj) {
        that.isUploading = false;
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
        }
      });

      upload.start();      
    }
  }
};
</script>

<style scoped>

</style>