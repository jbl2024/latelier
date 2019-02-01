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
  i18n: {
    messages: {
      en: {
        "Do you really want to delete this task?":
          "Do you really want to delete this task?"
      },
      fr: {
        "Do you really want to delete this task?":
          "Voulez-vous supprimer cette tâche définitivement ?"
      }
    }
  },
  methods: {
    deleteTask(id) {
      this.$confirm(this.$t("Do you really want to delete this task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.remove", id);
          this.$events.fire("close-task-detail");
        }
      });
    }
  }
};
</script>

<style scoped>
</style>