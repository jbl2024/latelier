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

      <template v-for="note in task.notes">
        <div class="note" :key="note._id">
        
          <div class="note-avatar">
            <author-avatar :user-id="note.createdBy"></author-avatar> 
          </div>

          <div class="note-content">
              <author-line class="note-author" :user-id="note.createdBy" :date="note.createdAt">
                <span v-if="note.edited">
                  ({{ $t('edited')}})
                </span>
              </author-line>
              <div class="ql-editor-view" v-html="linkifyHtml(note.content)" v-if="!isNoteEdited(note._id)"></div>
              <template v-if="isNoteEdited(note._id)">
                <rich-editor v-model="selectedNote.content" autofocus></rich-editor>
                <v-btn flat icon @click="updateNote">
                  <v-icon>check_circle</v-icon>
                </v-btn>
                <v-btn flat icon @click="cancelUpdateNote">
                  <v-icon>cancel</v-icon>
                </v-btn>
              </template>
          </div>

          <div class="note-actions" v-if="!isNoteEdited(note._id)">
            <v-btn small icon ripple @click="startEditNote(note)">
              <v-icon small color="grey lighten-1">edit</v-icon>
            </v-btn>
            <v-btn small icon ripple @click="deleteNote(note)">
              <v-icon small color="grey lighten-1">delete</v-icon>
            </v-btn>
          </div>
        </div>
        <v-divider inset></v-divider>
      </template>

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
      <v-btn v-show="hasNotes(task.notes)" class="primary" @click="startNewNote">{{ $t('Add note') }}</v-btn>
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

export default {
  mixins: [TextRenderingMixin],
  components: {
    VueEditor
  },
  props: {
    task: {
      type: Object
    }
  },
  i18n: {
    messages: {
      en: { 
        "Add note": "Add note",
        "edited": "edited",
      },
      fr: {
        "Add note": "Ajouter une note",
        "edited": "éditée",
      }
    }  
  },   
  data() {
    return {
      editNewNote: false,
      note: "",
      selectedNote: null
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
</style>
