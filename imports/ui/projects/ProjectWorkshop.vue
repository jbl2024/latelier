<template>
  <div class="project">
    <div v-if="!$subReady.workshop">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.workshop" class="project-wrapper">
      <div class="container-wrapper" :style="getBackgroundUrl(user)">
        <project-toolbar
          :user="user"
          :project="project"
          class="flex0"
        />
        <workshop-kanban
          ref="container"
          class="kanban-container flex1"
          :workshop-id="workshopId"
        />
        <v-navigation-drawer
          v-model="showDetail"
          :clipped="$vuetify.breakpoint.lgAndUp"
          class="elevation-16"
          fixed
          app
          right
          :width="600"
          stateless
          permanent
        >
          <v-card>
            Coucou
          </v-card>
        </v-navigation-drawer>
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Workshops } from "/imports/api/workshops/workshops";
import WorkshopKanban from "/imports/ui/workshops/WorkshopKanban";

export default {
  components: {
    WorkshopKanban
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    workshopId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      showDetail: false
    };
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", null);
  },
  meteor: {
    $subscribe: {
      workshop: function() {
        return [this.workshopId];
      },
      user() {
        return [];
      }
    },
    workshop() {
      return Workshops.findOne();
    },
    project() {
      return Projects.findOne();
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
      return null;
    }
  }
};
</script>

<style scoped>
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}

.project {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  position: relative;
  flex: 1;
}

.project-wrapper {
  display: flex;
  min-height: 0;
  flex-direction: column;
  flex: 1;
  position: relative;
}

@media (max-width: 600px) {
  .kanban-container {
    margin: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

@media (min-width: 601px) {
  .kanban-container {
    margin: 4px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: scroll;
    padding-left: 4px;
    height: 100%;
  }
}

.container-wrapper {
  overflow-y: hidden;
  height: 100%;
  width: 100%;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  /* box-shadow: inset 0 0 0 1000px rgba(0,0,0,.3); */
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
}

@media (max-width: 600px) {
  .container-wrapper {
    min-height: 100vh;
  }
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
}
</style>
