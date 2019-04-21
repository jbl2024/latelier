<template>
  <div class="project-process-diagram">
    <div v-if="!$subReady.processDiagram">
      <v-progress-linear indeterminate></v-progress-linear>
    </div>
    <div v-if="$subReady.processDiagram">
      <bpmn-modeler :xml="processDiagram.xml"></bpmn-modeler>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Lists } from "/imports/api/lists/lists.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { ProcessDiagrams } from "/imports/api/bpmn/processDiagrams";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";

export default {
  mixins: [TextRenderingMixin],
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", 0);
  },
  props: {
    projectId: {
      type: String,
      default: "0"
    },
    processDiagramId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      modeler: null
    };
  },
  meteor: {
    $subscribe: {
      processDiagram: function() {
        return [this.processDiagramId];
      }
    },
    processDiagram() {
      return ProcessDiagrams.findOne();
    },
    project() {
      return Projects.findOne();
    }
  },
  methods: {}
};
</script>

<style scoped>
#canvas {
  height: 90vh;
}
.empty {
  margin-top: 24px;
}
</style>