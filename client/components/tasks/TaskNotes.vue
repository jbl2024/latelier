<template>
  <div class="task-notes">

      <template v-for="note in task.notes">
        <div class="note" :key="note._id">
        
          <div class="note-avatar">
            <author-avatar small :user-id="note.createdBy"></author-avatar> 
          </div>

          <div class="note-content">
              <author-line class="note-author" :user-id="note.createdBy" :date="note.createdAt">
                <span v-if="note.edited">
                  ({{ $t('edited')}})
                </span>
              </author-line>
              <div class="ql-editor-view" v-html="linkifyHtml(note.content)" v-if="!isNoteEdited(note._id)"></div>
              <template v-if="isNoteEdited(note._id)">
                <rich-editor v-model="selectedNote.content" autofocus @submit="updateNote"></rich-editor>
                <v-btn text icon @click="updateNote">
                  <v-icon>mdi-check-circle</v-icon>
                </v-btn>
                <v-btn text icon @click="cancelUpdateNote">
                  <v-icon>mdi-close-circle</v-icon>
                </v-btn>
              </template>
          </div>

          <div class="note-actions" v-if="!isNoteEdited(note._id)">
            <v-btn small icon ripple @click="startEditNote(note)">
              <v-icon small color="grey lighten-1">mdi-pencil</v-icon>
            </v-btn>
            <v-btn small icon ripple @click="deleteNote(note)">
              <v-icon small color="grey lighten-1">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
        <v-divider inset :key="`divider-${note._id}`"></v-divider>
      </template>


      <div class="note">
        <div class="note-avatar">
          <author-avatar small :user-id="currentUserId"></author-avatar> 
        </div>
        <div class="note-content">
          <author-line class="note-author" :user-id="currentUserId"></author-line>
          <rich-editor v-model="note" @submit="addNote"></rich-editor>
          <v-btn color="primary" class="add-note" @click="addNote">
            {{ $t('Add note') }}
          </v-btn>
        </div>
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
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin, TextRenderingMixin],
  components: {
    VueEditor
  },
  props: {
    task: {
      type: Object
    }
  },
  computed: {
    currentUserId() {
      if (Meteor && Meteor.userId) return Meteor.userId();
    }
  },
  data() {
    return {
      note: "",
      selectedNote: null
    };
  },
  methods: {
    hasNotes(notes) {
      return notes && notes.length > 0;
    },

    addNote() {
      Meteor.call("tasks.addNote", this.task._id, this.note);
      this.note = "";
    },

    deleteNote(note) {
      Meteor.call("tasks.removeNote", this.task._id, note._id);
    },

    formatUser(userId) {
      var user = Meteor.users.findOne({ _id: userId });
      return user.emails[0].address;
    },

    startEditNote(note) {
      this.selectedNote = note;
    },

    isNoteEdited(id) {
      return this.selectedNote && this.selectedNote._id === id;
    },

    updateNote() {
      Meteor.call('tasks.updateNote', this.task._id, this.selectedNote, (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.selectedNote = null;
      });
    },

    cancelUpdateNote() {
      this.selectedNote = null;
    },
  }
};
</script>


<style scoped>
pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}
.task-notes {
  padding-bottom: 12px;
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
  margin-top: 24px;
  text-align: center;
}

.note {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.note-author {
  color: rgba(0,0,0,0.54);
  font-size: 11px;
  margin-bottom: 8px;
}

.note-avatar {
  flex: 0;
  margin-right: 24px;
}

.note-content {
  flex: 2;
}


.note-actions {
  flex: 0;
}

.empty-state {
  margin-top: 24px;
}

.add-note {
  margin-top: 8px;
}
</style>
