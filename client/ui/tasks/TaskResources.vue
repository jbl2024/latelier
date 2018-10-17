<template>

<div class="task-resources">
  <select-resource ref="selectResource" @select="onSelectResource"></select-resource>  
  <empty-state
    v-if="!task.resources || task.resources.length == 0"
    icon="category"
    label="Aucune ressource"
    description="Vous pouvez ajouter des ressources">
    <md-button class="md-primary md-raised" @click="addResource">Ajouter une ressource</md-button>
  </empty-state>

  <md-list class="md-double-line" v-show="task.resources && task.resources.length != 0"> 
    <md-subheader>Ressources

      <md-button class="md-icon-button" @click="addResource">
      <md-icon>add</md-icon>
      <md-tooltip md-delay="300">Ajouter une ressource</md-tooltip>
      </md-button>

    </md-subheader>

    <div class="md-elevation-1">
      <template v-for="item in resources" >
        <md-list-item :key='item._id'>
          <md-avatar class="md-avatar-icon md-primary">
            <md-icon>category</md-icon>
          </md-avatar>

          <div class="md-list-item-text pointer">
            <span>{{ item.name }}</span>
            <span>{{ item.description }}</span>
          </div>

          <md-button class="md-icon-button show-desktop" @click.stop="removeResource(item)">
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
import { Resources } from '/imports/api/resources/resources.js'

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
      this.$refs.selectResource.open()
    },

    onSelectResource (resource) {
      Meteor.call('tasks.addResource', this.task._id, resource._id)

    },

    removeResource (item) {
      Meteor.call('tasks.removeResource', this.task._id, item._id);
    },


  },
  meteor: {
    resources: {
      params () {
        return {
          id: this.task
        };
      },
      deep: true,
      update ({task}) {
        var ids = this.task.resources || [];
        return Resources.find({_id: {$in: ids}}, {sort: {name: 1}});
      }
    }
  }
};
</script>

<style scoped>
.task-resources {
  margin: 8px;
}
</style>