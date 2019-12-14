<template>
  <v-card class="card" tabindex="0" @click="openProject(project)">
    <v-card-title>
      <v-icon large left color="teal">
        mdi-chart-donut
      </v-icon>
      <span class="title font-weight-light">{{ $t("BPMN") }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <div class="indicator">
        <div class="legend grey--text">
          {{ $t("Diagrams") }}
        </div>
        <div class="number">
          {{ info.diagramCount }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "ProcessCard",
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    info: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    openProject(project) {
      this.$router.push({
        name: "project-bpmn",
        params: {
          projectId: project._id
        }
      });
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 4px;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.card .name {
  font-size: 14px;
  font-weight: bold;
}

.card .subtitle {
  font-size: 12px;
  min-height: 18px;
}

.card .indicator {
  text-align: center;
}

.card .indicator .legend {
  font-size: 11px;
}

.card .indicator .number {
  font-size: 18px;
  font-weight: bold;
}

.card .sep {
  border-right: 1px solid #ededed;
}
</style>
