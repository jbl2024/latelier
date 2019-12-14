<template>
  <v-card class="card" tabindex="0" @click="openProject(project)">
    <v-card-title>
      <v-img
        v-if="info.healthReport"
        :src="getIcon(info.healthReport.weather)"
        contain
        height="36"
        width="36"
        max-width="36"
      />
      <v-icon v-if="!info.healthReport" large left color="blue-grey">
        mdi-weather-cloudy
      </v-icon>
      <span class="ml-3 title font-weight-light">{{ $t("Weather") }}</span>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <div class="indicator">
        <div class="legend grey--text">
          {{ $t("Last report") }}
        </div>
        <div class="number">
          <template v-if="info.healthReport">
            {{ formatDate(info.healthReport.date) }}
          </template>
          <template v-if="!info.healthReport">
            {{ $t('No report defined') }}
          </template>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  name: "WeatherCard",
  mixins: [DatesMixin],
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
        name: "project-weather",
        params: {
          projectId: project._id
        }
      });
    },
    getIcon(weather) {
      return Meteor.absoluteUrl(`/weather/${weather}.svg`);
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
