<template>
  <project-title v-if="project" :project="project" />
  <organization-title v-else-if="organizationId" :organization-id="organizationId" />
  <home-title v-else-if="!project" />
</template>
<script>
export default {
  props: {
    organizationId: {
      type: String,
      default: null
    },
    project: {
      type: Object,
      default: null
    }
  }
};
</script>
