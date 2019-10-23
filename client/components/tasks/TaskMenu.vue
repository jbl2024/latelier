<template>
  <v-menu bottom left class="menu">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="openHistory()">
        <v-list-item-action>
          <v-icon>mdi-history</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t('History') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="cloneTask(task._id)">
        <v-list-item-action>
          <v-icon>mdi-content-copy</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t('Clone') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="$emit('startCloneToProject')">
        <v-list-item-action>
          <v-icon>mdi-content-duplicate</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t('cloneToProject.menu') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="deleteTask(task._id)">
        <v-list-item-action>
          <v-icon>mdi-delete</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t('Move to trash') }}</v-list-item-title>
      </v-list-item>
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
  data() {
    return {
      showMoveTask: false
    }
  },
  i18n: {
    messages: {
      en: {
        "Do you really want to delete this task?":
          "Do you really want to delete this task?",
        "Do you really want to clone this task?":
          "Do you really want to clone this task?"
      },
      fr: {
        "Do you really want to delete this task?":
          "Voulez-vous supprimer cette tâche ?",
        "Do you really want to clone this task?":
          "Voulez-vous dupliquer cette tâche ?"
      }
    }
  },
  methods: {
    cloneTask(id) {
      this.$confirm(this.$t("Do you really want to clone this task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Clone")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.clone", id, (error, result) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
              return;
            }
            this.$router.push({
              name: "project-task",
              params: {
                projectId: result.projectId,
                taskId: result._id
              }
            });
          });
        }
      });
    },

    moveTask(project) {

    },

    deleteTask(id) {
      this.$confirm(this.$t("Do you really want to delete this task?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Move to trash")
      }).then(res => {
        if (res) {
          Meteor.call("tasks.remove", id);
          this.$events.fire("close-task-detail");
        }
      });
    },
    openHistory() {
      this.$store.dispatch("showTaskHistory", true)
    }
  }
};
</script>

<style scoped>
</style>