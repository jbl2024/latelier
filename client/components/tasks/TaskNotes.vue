<template>
  <div class="task-notes">

      <template v-for="note in task.notes">
        <div :class="{note: true, 'note-left': !isMe(note.createdBy), 'note-right': isMe(note.createdBy)}" :key="note._id">
        
          <div class="note-avatar">
            <author-avatar small :user-id="note.createdBy"></author-avatar> 
            <div class="note-actions" v-if="!isNoteEdited(note._id) && canEditNote(note)">
              <v-btn small icon ripple @click="startEditNote(note)">
                <v-icon small color="grey lighten-1">mdi-pencil</v-icon>
              </v-btn>
              <v-btn small icon ripple @click="deleteNote(note)">
                <v-icon small color="grey lighten-1">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>

          <div class="note-content">
              <author-line class="note-author" :user-id="note.createdBy" :date="note.createdAt">
                <span v-if="note.edited">
                  ({{ $t('edited')}})
                </span>
              </author-line>
              <div class="bubble ql-editor-view" v-html="linkifyHtml(note.content)" v-if="!isNoteEdited(note._id)" @click.stop="startEditNote(note)"></div>
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

        </div>
      </template>

      <v-divider v-if="task.notes && task.notes.length > 0"></v-divider>
      <div class="add-note">
          <div class="input">
            <rich-editor no-border v-model="note" @submit="addNote" class="input"></rich-editor>
          </div>
          <div class="action">
            <v-btn @click="addNote" color="primary" :disabled="!note">
              {{ $t('Send') }} (⇧ + ⏎)
              <v-icon small right>mdi-send</v-icon>
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
      this.$confirm(this.$t("Delete note?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
            Meteor.call("tasks.removeNote", this.task._id, note._id, (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$store.dispatch("notify", this.$t('Note deleted'));
          });
        }
      });
    },

    formatUser(userId) {
      var user = Meteor.users.findOne({ _id: userId });
      return user.emails[0].address;
    },

    startEditNote(note) {
      if (!this.canEditNote(note)) return;
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

    isMe(userId) {
      return userId && Meteor.userId() && userId === Meteor.userId();
    },

    canEditNote(note) {
      return  Meteor.userId() && note.createdBy === Meteor.userId();
    }
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
  margin: 30px;
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
  margin-right: 12px;
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


.note-left .bubble {
  background-color: #e6e9f1;
  padding: 18px;
  margin-right: 80px;

  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;  
}


.note-right {
  flex-direction: row-reverse;
}

.note-right .bubble {
  background-color: #4b93fe;
  color: white;
  padding: 18px;
  margin-left: 80px;
  border-top-left-radius: 12px;
  border-bottom-right-radius: 12px;
  border-bottom-left-radius: 12px;
}

.note-right .note-author {
  text-align: right;
}

.note-right .note-avatar {
  margin-right: auto;
  margin-left: 12px;
}


.add-note {
  margin: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #ccc;
}

.add-note .input { 
  flex: 1;
}

.add-note .action {
  flex: 1;
  text-align: right;
  margin-top: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.add-note .action .v-btn {
  background-color: #4b93fe !important;
}

@media (max-width: 600px) {
  .note {
    margin: 12px;
  }

  .note-left .bubble {
    margin-right: 12px;
  }

  .note-right .bubble {
    margin-left: 12px;
  }
  .add-note {
    margin: 12px;
  }
}




</style>
