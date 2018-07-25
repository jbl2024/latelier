<template>

<div class="task-notes">
  <md-empty-state v-show="!hasNotes(notes)"
    md-icon="note"
    md-label="Aucune note"
    md-description="Vous pouvez ajouter des notes.">
    <md-button class="md-primary md-raised" @click="startNewNote">Créer une note</md-button>
  </md-empty-state>

  <div v-for="note in notes">
      <pre>{{ note.content}}</pre>
      <md-divider></md-divider>
  </div>

  <md-button v-show="hasNotes(notes)" class="md-primary md-raised" @click="startNewNote">Créer une note</md-button>

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


export default {
  props: {
    task: {
      type: Object
    }
  },
  watch: { 
    task: function(task, oldTask) { // watch it
      this.notes = task.notes;
    }
  },
  data() {
    return {
      editNewNote: false,
      note: '',
      notes: []
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
      Meteor.call('tasks.addNote', this.task._id, this.note, (error, result) => { 
        if (error) {
          return;
        }
        var task = Tasks.findOne({_id: this.task._id});
        this.notes = task.notes;
      });
    },

    cancelAddNote () {
      this.editNewNote = false;
    }
  }
};
</script>

<style scoped>

pre {
  font-family: Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif;
  white-space: pre-wrap;
}
</style>