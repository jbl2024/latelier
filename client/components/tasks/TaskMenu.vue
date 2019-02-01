<template>
  <v-menu bottom left class="menu">
    <v-btn slot="activator" icon>
      <v-icon>more_vert</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile @click="deleteTask(task._id)">
        <v-list-tile-title>{{ $t('Delete') }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    task: {
      type: Object
    }
  },
  methods: {
    deleteTask(id) {
      Meteor.call("tasks.remove", id);
      this.$events.fire("close-task-detail");
    }
  }
};
</script>

<style scoped>
</style>