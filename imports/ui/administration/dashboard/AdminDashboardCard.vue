<template>
  <v-card class="card">
    <v-card-title>
      <v-icon large left :color="color">
        {{ icon }}
      </v-icon>
      <span class="title font-weight-light">{{ title }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <div class="indicator">
        <div class="legend grey--text">
          {{ legend }}
        </div>
        <div class="number">
          {{ value }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "AdminDashboardCard",
  props: {
    icon: {
      type: String,
      default: "mdi-view-dashboard"
    },
    color: {
      type: String,
      default: "teal"
    },
    title: {
      type: String,
      default: ""
    },
    legend: {
      type: String,
      default: ""
    },
    value: {
      type: [String, Number],
      default: ""
    },
    link: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    open() {
      if (!this.link?.name) {
        return;
      }
      this.$router.push(link);
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 4px;
  overflow: hidden;
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
