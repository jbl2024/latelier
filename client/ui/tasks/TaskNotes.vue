<template>

<div class="task-notes">
  <md-empty-state v-show="!hasNotes(task.notes) && !editNewNote"
    md-icon="note"
    md-label="Aucune note"
    md-description="Vous pouvez ajouter des notes.">
    <md-button class="md-primary md-raised" @click="startNewNote">Créer une note</md-button>
  </md-empty-state>

  <div v-for="note in task.notes" :key='note._id'>
      <div class="note">
        <div v-html="markDown(note.content)"></div>
        <div class="metadata">
          <author-line :user-id="note.createdBy" :date="note.createdAt"></author-line>
          <div class="action">
            <md-button class="md-icon-button delete-button" @click="deleteNote(note)">
              <md-icon>delete</md-icon>
            </md-button>
          </div>
        </div>

      </div>

      <md-divider></md-divider>
  </div>

  <div class="center">
    <md-button v-show="hasNotes(task.notes)" class="md-primary md-raised" @click="startNewNote">Créer une note</md-button>
  </div>

  <div v-show="editNewNote">
    <md-field>
      <label>Note</label>
      <md-textarea ref="newNote" v-model="note" @keyup.ctrl.enter="addNote"></md-textarea>
    </md-field>
    <md-button class="md-icon-button" @click.native="addNote">
      <md-icon>check_circle</md-icon>
    </md-button>

    <md-button class="md-icon-button" @click.native="cancelAddNote">
      <md-icon>cancel</md-icon>
    </md-button>
  </div>
    
</div>

</template>

<script>
import { Projects } from '/imports/api/projects/projects.js'
import { Lists } from '/imports/api/lists/lists.js'
import { Tasks } from '/imports/api/tasks/tasks.js'
import moment from 'moment';
import 'moment/locale/fr'

import MarkdownMixin from '/imports/ui/mixins/MarkdownMixin.js'

export default {
  mixins: [MarkdownMixin],
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      editNewNote: false,
      note: '',
    };
  },
  methods: {

    hasNotes (notes) {
      return notes && notes.length > 0;
    },

    startNewNote () {
      this.editNewNote = true;
      this.note = '';
      this.$nextTick(() => this.$refs.newNote.$el.focus());
    },

    addNote () {
      this.editNewNote = false;
      Meteor.call('tasks.addNote', this.task._id, this.note);
    },

    deleteNote (note) {
      Meteor.call('tasks.removeNote', this.task._id, note._id);
    },

    cancelAddNote () {
      this.editNewNote = false;
    },

    formatDateDuration (date) {
      var now = moment();
      var noteDate = moment(date);
      var duration = moment.duration(now.diff(noteDate)).locale('fr');
      return 'il y a ' + duration.humanize();

      // return moment(date).format('DD/MM/YYYY HH:mm');
    },

    formatDate (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },

    formatUser (userId) {
      var user = Meteor.users.findOne({_id: userId});
      return user.emails[0].address;
    }

  }
};
</script>

<style scoped>

pre {
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  white-space: pre-wrap;
}

.delete-button {
}

.md-empty-state {
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

.metadata .action .md-button {
  margin-top: -10px;
  padding-top: 0;
}

.center {
  text-align: center;
}



</style>