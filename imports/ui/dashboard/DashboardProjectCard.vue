<template>
  <v-card class="card" @click="openProject(project)">
    <v-card-title>
      <div>
        <div class="name">{{ project.name }}</div>
        <div class="subtitle grey--text">{{ formatProjectDates(project) }}</div>
      </div>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-layout>
        <v-flex xs6>
          <div class="indicator sep">
            <div class="legend grey--text">{{ $t('Tasks') }}</div>
            <div class="number">{{ taskCount(project) }}</div>
          </div>
        </v-flex>
        <v-flex xs6>
          <div class="indicator">
            <div class="legend grey--text">{{ $t('Users') }}</div>
            <div class="number">{{ userCount(project) }}</div>
          </div>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn icon flat color="grey ligthen-1">
        <v-icon>star</v-icon>
      </v-btn>
      <v-btn icon flat color="grey ligthen-1">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
export default {
  name: "dashboard-project-card",
  mixins: [DatesMixin],
  props: {
    project: Object
  },
  i18n: {
    messages: {
      en: {
        "Users": "Users",
        "Tasks": "Tasks"
      },
      fr: {
        "Users": "Utilisateurs",
        "Tasks": "Tâches"
      }
    }
  },
  methods: {
    getVisibilityIcon(project) {
      if (project.isPublic) {
        return "visibility";
      }
      return "visibility_off";
    },

    getVisibilityIconClass(project) {
      if (project.isPublic) {
        return "";
      }
      return "";
    },

    getColor(item) {
      return item.color;
    },

    formatProjectDates(project) {
      if (project.startDate && project.endDate) {
        return (
          "Du  " +
          this.formatDate(project.startDate) +
          " au " +
          this.formatDate(project.endDate)
        );
      } else if (project.startDate) {
        return "A partir du " + this.formatDate(project.startDate);
      } else if (project.endtDate) {
        return "Jusqu'au " + this.formatDate(project.endDate);
      }
      return this.$t("No dates");
    },

    taskCount(project) {
      return project.taskCount;
    },

    userCount(project) {
      const members = project.members || [];
      return members.length;
    },

    openProject(project) {
      this.$router.push({
        name: "project",
        params: {
          projectId: project._id
        }
      });
    },

  }
};
</script>

<style scoped>
.card {
  border-radius: 4px;
}

.card:hover {
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}


.card .name {
  font-size: 16px;
  font-weight: bold;
}

.card .subtitle {
  font-size: 12px;
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