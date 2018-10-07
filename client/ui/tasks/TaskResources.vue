<template>

<div class="task-resources">
      <md-empty-state
        v-if="!task.resources || task.resources.length == 0"
        md-icon="category"
        md-label="Aucune ressource"
        md-description="Vous pouvez ajouter des ressources">
        <md-button class="md-primary md-raised" @click="addResource">Ajouter une ressource</md-button>
      </md-empty-state>

      <md-list class="md-double-line" v-show="task.resources && task.resources.length != 0"> 
        <md-subheader>Ressources

          <md-button class="md-icon-button" @click="addResource">
          <md-icon>add</md-icon>
          <md-tooltip md-delay="300">Ajouter une ressource</md-tooltip>
          </md-button>
  
        </md-subheader>

        <div class="md-elevation-1">
          <template v-for="item in task.resources" >
            <md-list-item :key='item._id'>
              <md-avatar class="md-avatar-icon md-primary">
                <md-icon>category</md-icon>
              </md-avatar>

              <div class="md-list-item-text pointer">
                <span>{{ item.name }}</span>
                <span>{{ item.description }}</span>
              </div>

              <md-button class="md-icon-button show-desktop" @click.stop="removeResource(item._id)">
                <md-icon>delete</md-icon>
                <md-tooltip md-delay="300">Supprimer</md-tooltip>
              </md-button>
            </md-list-item>
            <md-divider></md-divider>
          </template>
        </div>
      </md-list>  
</div>

</template>

<script>

export default {
  name: 'task-resources',
  props: {
    task: {
      type: Object
    }
  },
  data() {
    return {
      editNewItem: false,
      item: '',
      showButtons: false
    };
  },
  methods: {
    

    addResource () {
    },

    removeResource (item) {
      Meteor.call('tasks.removeChecklistItem', this.task._id, item._id);
    },


  }
};
</script>

<style scoped>

</style>