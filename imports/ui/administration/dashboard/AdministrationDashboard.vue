<template>
  <div class="page">
    <div class="container-wrapper" :style="getBackgroundUrl(user)">
      <v-container ref="cards" v-resize="onResize" fluid>
        <v-row>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Users')"
              icon="mdi-account-group"
              :legend="$t('Total')"
              :value="info.userCount"
              color="red"
            />
          </v-col>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Organizations')"
              icon="mdi-domain"
              :legend="$t('Total')"
              :value="info.organizationCount"
              color="blue"
            />
          </v-col>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Projects')"
              icon="mdi-home"
              :legend="$t('Total')"
              :value="info.projectCount"
              color="blue"
            />
          </v-col>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Tasks')"
              icon="mdi-format-list-bulleted"
              :legend="$t('Total')"
              :value="info.taskCount"
              color="blue"
            />
          </v-col>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Attachments')"
              icon="mdi-attachment"
              :legend="$t('Total')"
              :value="info.attachmentCount"
              color="teal"
            />
          </v-col>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Diagrams')"
              icon="mdi-chart-donut"
              :legend="$t('Total')"
              :value="info.processDiagramCount"
              color="teal"
            />
          </v-col>
          <v-col :cols="cardColumns">
            <admin-dashboard-card
              :title="$t('Weather')"
              icon="mdi-weather-cloudy"
              :legend="$t('Total')"
              :value="info.healthReportCount"
              color="blue-grey"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import AdminDashboardCard from "./AdminDashboardCard";

export default {
  components: {
    AdminDashboardCard
  },
  data() {
    return {
      info: {},
      cardColumns: 4
    };
  },
  mounted() {
    this.refresh();
  },
  meteor: {
    $subscribe: {
      user: function() {
        return [];
      }
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    getBackgroundUrl(user) {
      if (user && user.profile) {
        const { background } = user.profile;
        if (background) {
          return `background-image: url('${background}');`;
        }
      }
      return "";
    },

    refresh() {
      Meteor.call(
        "administration.info",
        { projectId: this.projectId },
        (error, result) => {
          if (error) {
            this.$notifyError(error);
            return;
          }
          this.info = result;
        }
      );
    },

    onResize() {
      const { cards } = this.$refs;
      const width = cards.offsetWidth;
      if (width > 600) {
        this.cardColumns = 4;
      } else {
        this.cardColumns = 12;
      }
    }

  }
};
</script>

<style scoped>
.page {
  min-height: calc(100vh - 112px);
}

.container-wrapper {
  overflow-y: scroll;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: row;
}

</style>
