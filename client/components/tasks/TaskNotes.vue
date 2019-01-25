<template>
  <div class="task-notes">
    <empty-state
      v-show="!hasNotes(task.notes) && !editNewNote"
      icon="note"
      label="Aucune note"
      description="Vous pouvez ajouter des notes."
    >
      <v-btn class="primary" @click="startNewNote">Ajouter une note</v-btn>
    </empty-state>

    <div v-for="note in task.notes" :key="note._id">
      <div class="note">
        <div v-html="markDown(note.content)"></div>
        <div class="metadata">
          <author-line :user-id="note.createdBy" :date="note.createdAt"></author-line>
          <div class="action">
            <v-btn icon flat color="grey" @click="deleteNote(note)">
              <v-icon>delete</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <v-divider></v-divider>
    </div>

    <div v-show="editNewNote">
      <rich-editor v-model="note" ref="newNote"></rich-editor>
      <v-btn flat icon @click="addNote">
        <v-icon>check_circle</v-icon>
      </v-btn>
      <v-btn flat icon @click="cancelAddNote">
        <v-icon>cancel</v-icon>
      </v-btn>
    </div>

    <div class="center" v-if="!editNewNote">
      <v-btn v-show="hasNotes(task.notes)" class="primary" @click="startNewNote">Ajouter une note</v-btn>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import moment from "moment";
import "moment/locale/fr";
import { VueEditor } from "vue2-editor";

import MarkdownMixin from "/imports/ui/mixins/MarkdownMixin.js";

export default {
  mixins: [MarkdownMixin],
  components: {
    VueEditor
  },
  props: {
    task: {
      type: Object
    }
  },

  data() {
    return {
      editNewNote: false,
      note: ""
    };
  },
  methods: {
    hasNotes(notes) {
      return notes && notes.length > 0;
    },

    startNewNote() {
      this.editNewNote = true;
      this.note = "";
      this.$nextTick(() => this.$refs.newNote.focus());
    },

    addNote() {
      this.editNewNote = false;
      Meteor.call("tasks.addNote", this.task._id, this.note);
    },

    deleteNote(note) {
      Meteor.call("tasks.removeNote", this.task._id, note._id);
    },

    cancelAddNote() {
      this.editNewNote = false;
    },

    formatDateDuration(date) {
      var now = moment();
      var noteDate = moment(date);
      var duration = moment.duration(now.diff(noteDate)).locale("fr");
      return "il y a " + duration.humanize();

      // return moment(date).format('DD/MM/YYYY HH:mm');
    },

    formatDate(date) {
      return moment(date).format("DD/MM/YYYY HH:mm");
    },

    formatUser(userId) {
      var user = Meteor.users.findOne({ _id: userId });
      return user.emails[0].address;
    }
  }
};
</script>


<style scoped>
pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}

.delete-button {
}

.empty-state {
  transition: none;
}

.note {
  margin: 8px;
}

.metadata {
  display: flex;
  flex-direction: row;
}

.metadata .author-line {
  display: inline-block;
  flex: 1;
}
.metadata .action {
  display: inline-block;
}

.center {
  text-align: center;
}
</style>