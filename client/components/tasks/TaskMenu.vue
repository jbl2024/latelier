<template>
  <v-menu bottom left class="menu" :close-on-content-click="$vuetify.breakpoint.xsOnly">
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item>
        <v-list-item-action>
          <v-icon>mdi-swap-horizontal</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t("Move") }}</v-list-item-title>
        <v-list-item-action>
          <v-btn icon small @click="moveToLeft(task._id)">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-action>
          <v-btn icon small @click="moveToRight(task._id)">
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-divider />
      <v-list-item @click="openExport()">
        <v-list-item-action>
          <v-icon>mdi-file-export</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t("Export") }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openHistory()">
        <v-list-item-action>
          <v-icon>mdi-history</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t("History") }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="cloneTask(task._id)">
        <v-list-item-action>
          <v-icon>mdi-content-copy</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t("Clone") }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="$emit('startCloneToProject')">
        <v-list-item-action>
          <v-icon>mdi-content-duplicate</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t("cloneToProject.menu") }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="deleteTask(task._id)">
        <v-list-item-action>
          <v-icon>mdi-delete</v-icon>
        </v-list-item-action>
        <v-list-item-title>{{ $t("Move to trash") }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showMoveTask: false
    };
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
    async cloneTask(id) {
      try {
        await this.$confirm(this.$t("Do you really want to clone this task?"), {
          title: this.$t("Confirm"),
          cancelText: this.$t("Cancel"),
          confirmText: this.$t("Clone")
        });
        const result = await Meteor.callAsync("tasks.clone", id);
        this.$router.push({
          name: "project-task",
          params: {
            projectId: result.projectId,
            taskId: result._id
          }
        });
      } catch (error) {
        this.$notifyError(error);
      }
    },

    moveTask() {},

    async deleteTask(id) {
      try {
        await this.$confirm(this.$t("Do you really want to delete this task?"), {
          title: this.$t("Confirm"),
          cancelText: this.$t("Cancel"),
          confirmText: this.$t("Move to trash")
        });

        await Meteor.callAsync("tasks.remove", id);
        this.$store.dispatch("showTaskDetail", false);
      } catch (error) {
        this.$notifyError(error.message);
      }
    },

    openHistory() {
      this.$store.dispatch("showTaskHistory", true);
    },

    openExport() {
      this.$store.dispatch("showTaskExport", true);
    },

    async moveToLeft(id) {
      try {
        await Meteor.callAsync("tasks.moveToAdjacentList", { taskId: id, direction: "left" });
        this.$notify(this.$t("Task moved"));
      } catch (error) {
        this.$notifyError(error);
      }
    },

    async moveToRight(id) {
      try {
        await Meteor.callAsync("tasks.moveToAdjacentList", { taskId: id, direction: "right" });
        this.$notify(this.$t("Task moved"));
      } catch (error) {
        this.$notifyError(error);
      }
    }
  }
};
</script>

<style scoped></style>
