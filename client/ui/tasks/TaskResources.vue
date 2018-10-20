<template>

<div class="task-resources">
  <select-resource ref="selectResource" @select="onSelectResource"></select-resource>  
  <empty-state
    v-if="!task.resources || task.resources.length == 0"
    icon="category"
    label="Aucune ressource"
    description="Vous pouvez ajouter des ressources">
    <v-btn class="primary" @click="addResource">Ajouter une ressource</v-btn>
  </empty-state>

  <div v-show="task.resources && task.resources.length != 0">
    <v-subheader>Ressources
      <v-btn flat icon @click="addResource">
        <v-icon>add</v-icon>
      </v-btn>
    </v-subheader>
    <v-list two-line class="elevation-1">

      <template v-for="(item, index) in resources">
        <v-list-tile :key='item._id' avatar>
          <v-list-tile-avatar>
            <v-icon>category</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ item.name }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ item.description }}</v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-btn icon flat  color="grey"  @click.stop="removeResource(item)">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-list-tile-action>

        </v-list-tile>
        <v-divider inset v-if="index != resources.length - 1"></v-divider>
      </template>
    </v-list>
  </div>
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