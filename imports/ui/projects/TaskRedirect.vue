<template>
  <div />
</template>

<script>
export default {
  name: "TaskRedirect",
  props: {
    taskNumber: {
      type: String,
      default: ""
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

<style scoped></style>
