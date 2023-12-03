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
  async mounted() {
    try {
      const result = await Meteor.asyncCall("tasks.getUrl", Number(this.taskNumber));
      this.$router.push({
        name: "project-task",
        params: {
          projectId: result.projectId,
          taskId: result.taskId
        }
      });
    } catch (error) {
      this.$notifyError(error);
    }
  }
};
</script>

<style scoped></style>
