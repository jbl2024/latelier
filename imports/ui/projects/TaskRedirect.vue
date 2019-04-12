<template>
  <div></div>
</template>

<script>
export default {
  name: "task-redirect",
  props: {
    taskNumber: {
      type: String
    }
  },
  mounted() {
    Meteor.call("tasks.getUrl", Number(this.taskNumber), (error, result) => {
      if (error) {
        this.$store.dispatch("notifyError", error);
        return;
      }
      this.$router.push({
        name: "project-task",
        params: {
          projectId: result.projectId,
          taskId: result.taskId
        }
      });
    });
  }
};
</script>

<style scoped>
</style>