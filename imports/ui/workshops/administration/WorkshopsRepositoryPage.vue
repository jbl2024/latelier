<template>
  <div class="project-dashboard">
    <div v-if="!$subReady.user">
      <v-progress-linear indeterminate />
    </div>
    <template v-if="isAdmin()">
      <v-tabs>
        <v-tab id="tab-users">
          {{ $t('Activities') }}
        </v-tab>
        <v-tab-item>
          <administration-activities />
        </v-tab-item>
      </v-tabs>
    </template>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";
import AdministrationActivities from "./AdministrationActivities";

export default {
  components: {
    AdministrationActivities
  },
  props: {},
  data() {
    return {
      cardColumns: 4
    };
  },
  meteor: {
    $subscribe: {
      user() {
        return [];
      }
    },
    user() {
      return Meteor.user();
    }
  },
  methods: {
    isAdmin() {
      return Permissions.isAdmin(Meteor.userId());
    },
    getBackgroundUrl(user) {
      if (user && user.profile) {
        const { background } = user.profile;
        if (background) {
          return `background-image: url('${background}');`;
        }
      }
      return "";
    },
    onResize() {
      const { cards } = this.$refs;
      const width = cards.offsetWidth;
      if (width > 600) {
        this.cardColumns = 4;
      } else {
        this.cardColumns = 12;
      }
    },

    activities() {
      return {
        title: this.$t("Activities"),
        legend: this.$t("Number"),
        icon: "mdi-gamepad-variant",
        data: 12
      };
    },

    icebreakers() {
      return {
        title: this.$t("Icebreakers"),
        legend: this.$t("Number"),
        icon: "mdi-account-multiple-check",
        data: 12
      };
    },

    jolts() {
      return {
        title: this.$t("Jolts"),
        legend: this.$t("Number"),
        icon: "mdi-flash",
        data: 12
      };
    }

  }
};
</script>

<style scoped>
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


@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}

.left {
  flex: 1;
}

.right {
  flex-direction: column;
  overflow-y: auto;
  width: 360px;
  background-color: white;
  border-left: 1px solid #ddd;
  display: flex;
  position: relative;
}

</style>
