<template>
  <div class="project-detail">
    <div class="toolbar">
      <div class="title edit toolbar-title" v-show="editProjectName">

        <v-text-field
          ref="name"
          class="edit-name"
          autofocus
          outlined
          solo
          auto-grow
          v-model="project.name"
          @keydown.enter="updateProjectName"
        ></v-text-field>
        <v-btn icon @click="updateProjectName">
          <v-icon>mdi-check-circle</v-icon>
        </v-btn>
        <v-btn icon @click="cancelProjectTaskName">
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </div>

      <div class="toolbar-button" v-if="!editProjectName">
        <v-btn icon text @click="requestClose()" v-shortkey="['esc']" @shortkey="requestClose()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="toolbar-title" @click="startEditProjectName" v-if="!editProjectName">
        <span class="project-name" v-html="linkifyHtml(project.name)"></span>
      </div>
      <div class="toolbar-button" v-if="!editProjectName">
      </div>
    </div>
    <v-btn text :to="{name: 'project', params: { projectId: project._id }}">{{ $t('Open') }}</v-btn>

    <project-settings-general :project="project"></project-settings-general>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Attachments } from "/imports/api/attachments/attachments";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [TextRenderingMixin, DatesMixin],
  props: {
    active: Boolean,
    project: {
      type: Object
    },
    showTaskDetail: {
      type: Boolean
    }
  },
  data() {
    return {
      editProjectName: false,
      savedName: "",
    };
  },
  meteor: {
  },
  methods: {
    requestClose() {
      this.$emit("update:active", false);
    },

    startEditProjectName() {
      this.savedName = this.project.name;
      this.editProjectName = true;
      this.$nextTick(() => this.$refs.name.focus());
    },

    updateProjectName() {
      this.editProjectName = false;
      Meteor.call(
        "projects.updateName",{ 
          projectId: this.project._id,
          name: this.project.name
        },
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            this.project.name = this.savedName;
            return;
          }
        }
      );
    },

    cancelProjectTaskName() {
      this.editProjectName = false;
      this.project.name = this.savedName;
    }

  }
};
</script>

<style scoped>

.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}


.project-name {
  cursor: text;
}
.edit-name {
  font-weight: normal;
}
.number {
  color: rgba(0, 0, 0, 0.54);
  font-size: 80%;
  margin-right: 4px;
}


.toolbar-button {
  flex: 1;
  max-width: 42px;
  margin-left: 8px;
  margin-right: 8px;
}

.toolbar-title {
  flex: 2;
  font-size: 18px;
}

.menu {
  z-index: 10000;
}
.description {
  margin: 24px;
}

pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}
</style>