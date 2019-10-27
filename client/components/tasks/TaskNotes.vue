<template>
  <div class="task-notes">
    <template v-for="aNote in task.notes">
      <div
        :key="aNote._id"
        :class="{
          note: true,
          'note-left': !isMe(aNote.createdBy),
          'note-right': isMe(aNote.createdBy)
        }"
      >
        <div class="note-avatar">
          <author-avatar small :user-id="aNote.createdBy" />
          <div
            v-if="!isNoteEdited(aNote._id) && canEditNote(aNote)"
            class="note-actions"
          >
            <v-btn small icon ripple @click="startEditNote(aNote)">
              <v-icon small color="grey lighten-1">
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn small icon ripple @click="deleteNote(aNote)">
              <v-icon small color="grey lighten-1">
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </div>

        <div class="note-content">
          <author-line
            class="note-author"
            :user-id="aNote.createdBy"
            :date="aNote.createdAt"
          >
            <span v-if="aNote.edited"> ({{ $t("edited") }}) </span>
          </author-line>
          <div
            v-if="!isNoteEdited(aNote._id)"
            class="bubble ql-editor-view"
            @click.self="startEditNote(aNote)"
            v-html="linkifyHtml(aNote.content)"
          />
          <template v-if="isNoteEdited(aNote._id)">
            <rich-editor
              v-model="selectedNote.content"
              autofocus
              @submit="updateNote"
            />
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

    <v-divider v-if="task.notes && task.notes.length > 0" />
    <div class="add-note">
      <div class="input">
        <rich-editor v-model="note" no-border class="input" @submit="addNote" />
      </div>
      <div class="action">
        <v-btn color="primary" :disabled="!note" @click="addNote">
          {{ $t("Send") }} (⇧ + ⏎)
          <v-icon small right>
            mdi-send
          </v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import "moment/locale/fr";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin, TextRenderingMixin],
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      note: "",
      selectedNote: null
    };
  },
  computed: {
    currentUserId() {
      if (Meteor && Meteor.userId) return Meteor.userId();
      return null;
    }
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
      }).then((res) => {
        if (res) {
          Meteor.call(
            "tasks.removeNote",
            this.task._id,
            note._id,
            (error) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Note deleted"));
            }
          );
        }
      });
    },

    formatUser(userId) {
      const user = Meteor.users.findOne({ _id: userId });
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
      Meteor.call(
        "tasks.updateNote",
        this.task._id,
        this.selectedNote,
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.selectedNote = null;
        }
      );
    },

    cancelUpdateNote() {
      this.selectedNote = null;
    },

    isMe(userId) {
      return userId && Meteor.userId() && userId === Meteor.userId();
    },

    canEditNote(note) {
      return Meteor.userId() && note.createdBy === Meteor.userId();
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
  color: rgba(0, 0, 0, 0.54);
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

<style>
.note-right .linkified {
  color: white !important;
}
.note-right .task-number {
  color: white !important;
}
</style>
