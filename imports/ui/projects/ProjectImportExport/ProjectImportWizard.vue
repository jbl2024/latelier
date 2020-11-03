<template>
  <div v-if="isLoading">
    Chargement
  </div>  
  <div v-else-if="zippedProject" class="project-import-wizard">
    <pre> {{ project }} </pre>
    <pre> {{ itemsToExport }} </pre>
    <!--
    <v-stepper v-model="currentStep" vertical>
      <v-stepper-step step="1" complete>
      </v-stepper-step>
      <v-stepper-content step="1">
        <v-card color="grey lighten-1" class="mb-12" height="200px"></v-card>
        <v-btn color="primary" @click="currentStep = 2"> Continue </v-btn>
        <v-btn text> Cancel </v-btn>
      </v-stepper-content>
    </v-stepper> -->
  </div>
</template>
<script>
export default {
  props: {
    zippedProject: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      isLoading: false,
      project: null,
      itemsToExport: [],
      currentStep: 1
    }
  },
  watch: {
    zippedProject: {
      immediate: true,
      async handler(zippedProject) {
        this.project = await zippedProject.getProject();
        this.itemsToExport = zippedProject.getItemsToExport();
      }
    }
  }
}
</script>