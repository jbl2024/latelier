<template>
  <div class="list" @dragover="onDragOver">
    <select-activity
      :active.sync="showSelectActivityDialog"
      @select="onSelectActivity"
    />
    <div class="list-header">
      <div class="swimlane dragscroll">
        <div v-show="!isSessionEdited(session, selectedSession)" :style="getColor()">
          <div :style="getColor()" class="flex-container-row list-name-wrapper">
            <div
              v-if="hiddenTaskCount == 0"
              class="list-name flex1"
              @click="editSession(session)"
            >
              {{ session.name }}
            </div>
            <div
              v-if="hiddenTaskCount > 0"
              class="list-name flex1"
              @click="editSession(session)"
            >
              {{ session.name }} ({{ hiddenTaskCount }}/{{ taskCount }})
            </div>
            <v-menu bottom left class="flex0">
              <template v-slot:activator="{ on }">
                <v-btn :dark="isDark()" small icon v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item @click="addActivity(session._id)">
                  <v-list-item-action>
                    <v-icon>mdi-plus</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>
                    {{ $t("Add new activity") }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteList(session._id)">
                  <v-list-item-action>
                    <v-icon>mdi-delete</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{ this.$t("Delete") }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
        <div
          v-show="isSessionEdited(session, selectedSession)"
          class="list-edit flex-container-row"
        >
          <input
            ref="name"
            v-model="session.name"
            type="text"
            class="flex1"
            @keyup.esc="cancelUpdate(session)"
            @keyup.enter="updateName(session)"
          >
          <div class="flex0">
            <div class="flex-container-row">
              <v-btn text icon @click.native="updateName(session)">
                <v-icon>mdi-check-circle</v-icon>
              </v-btn>
              <v-btn text icon @click.native="cancelUpdate(session)">
                <v-icon>mdi-close-circle</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tasks-wrapper dragscroll">
      <v-btn small block class="dragscroll" @click="addActivity(session._id)">
        {{ $t("Add new activity") }}
      </v-btn>
      <div ref="tracks" class="tracks dragscroll">
        <template v-for="track in tracks">
          <workshop-track
            :key="track._id"
            :track="track"
            class="track"
            :data-id="track._id"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Tasks } from "/imports/api/tasks/tasks.js";
import { Tracks } from "/imports/api/workshops/tracks/tracks";
import { Attachments } from "/imports/api/attachments/attachments";
import SelectActivity from "./SelectActivity.vue";
import WorkshopTrack from "./WorkshopTrack.vue";

import { colors } from "/imports/colors";
import { mapState } from "vuex";

import * as Sortable from "sortablejs";

export default {
  components: {
    SelectActivity,
    WorkshopTrack
  },
  props: {
    session: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      selectedSession: {},
      savedName: "",
      showSelectActivityDialog: false,
      sortable: null
    };
  },
  computed: {
    ...mapState(["currentProjectId"]),
    projectColor: {
      get() {
        const project = Projects.findOne({ _id: this.currentProjectId });
        if (project && project.color) {
          return project.color;
        }
        return null;
      }
    }
  },
  watch: {
    "list.autoComplete"(autoComplete, prevValue) {
      if (prevValue !== autoComplete) {
        Meteor.call("lists.autoComplete", this.session._id, autoComplete);
      }
    },
    "list.catchCompleted"(catchCompleted, prevValue) {
      if (prevValue !== catchCompleted) {
        Meteor.call("lists.catchCompleted", this.session._id, catchCompleted);
      }
    }
  },
  mounted() {
    this.$events.listen("edit-session", (sessionId) => {
      if (sessionId === this.session._id) {
        this.editSession(this.session);
      }
    });
    const options = {
      delayOnTouchOnly: true,
      delay: 250,
      animation: 150,
      group: "tasks",
      onUpdate: (event) => {
        this.handleMove(event);
      },
      onAdd: (event) => {
        this.handleMove(event);
      }
    };
    this.sortable = Sortable.create(this.$refs.tracks, options);
  },
  beforeDestroy() {
    this.$events.off("filter-tasks");
    this.$events.off("edit-list");
  },
  meteor: {
    tracks() {
      return Tracks.find({ sessionId: this.session._id });
    },
    taskCount() {
      return Tasks.find({ sessionId: this.session._id }).count();
    },
    tasksForEstimation() {
      return Tasks.find({
        sessionId: this.session._id,
        estimation: { $exists: true }
      });
    },
    hiddenTaskCount() {
      return Tasks.find({ sessionId: this.session._id, completed: true }).count();
    }
  },
  methods: {
    editSession(session) {
      this.selectedSession = session;
      this.savedName = this.selectedSession.name;
      this.$nextTick(() => this.$refs.name.focus());
    },

    isSessionEdited(session, selectedSession) {
      if (!session || !selectedSession) {
        return false;
      }
      const edited = session._id === selectedSession._id;
      return edited;
    },

    updateName(session) {
      if (session.name.length === 0) {
        session.name = this.savedName;
      }
      this.selectedSession = null;

      Meteor.call("workshops.sessions.update", {
        sessionId: session._id,
        name: session.name
      }, (error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
        }
      });
    },

    cancelUpdate(session) {
      session.name = this.savedName;
      this.selectedSession = null;
    },

    deleteList(sessionId) {
      this.$confirm(this.$t("Delete session?"), {
        title: this.$t("Confirm"),
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call("workshops.sessions.remove", { sessionId }, (error) => {
            if (error) {
              this.$store.dispatch("notifyError", error);
            }
          });
        }
      });
    },

    addActivity() {
      this.showSelectActivityDialog = true;
    },

    onSelectActivity(activity) {
      Meteor.call("workshops.tracks.create", {
        sessionId: this.session._id,
        activityId: activity._id
      },(error) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
        }
      });
    },

    getTransferData(session) {
      return {
        type: "session",
        data: session
      };
    },

    getColor() {
      if (this.projectColor) {
        return `
          background-color: ${this.projectColor};
          color: ${colors.getLabelColor(this.projectColor)}
        `;
      }
      return `
          background-color: #2D6293;
          color: white;
        `;
    },

    isDark() {
      if (this.projectColor) {
        return colors.isDark(this.projectColor);
      }
      return true;
    },

    handleMove(event) {
      const trackId = event.item.dataset.id;
      const index = event.newIndex;
      if (index < this.tracks.length) {
        const nextTrack = this.tracks[index];
        Meteor.call(
          "tracks.move", {
            workshopId: this.workshopId,
            sessionId: this.session._id,
            trackId: trackId,
            order: nextTrack.order - 1
          }
        );
      } else {
        Meteor.call(
          "tracks.move", {
            workshopId: this.workshopId,
            sessionId: this.session._id,
            trackId: trackId,
            order: 1
          }
        );
      }
    },

    onDragOver(e) {
      e.preventDefault();
    }
  }
};
</script>

<style scoped>
@media (max-width: 600px) {
  .swimlane {
    flex: 0 0 auto;
    width: 100%;
    display: inline-block;
    margin-right: 8px;
  }
  .tasks-wrapper {
    width: 100%;
    margin-top: 4px;
  }
}

@media (min-width: 601px) {
  .swimlane {
    flex: 0 0 auto;
    width: 274px;
    display: inline-block;
    margin-right: 8px;
  }

  .tasks-wrapper {
    width: 274px;
    overflow-y: auto;
    flex: 1;
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0;
    scrollbar-width: none; /* Firefox */
  }
}

.swimlane.new .list-title {
  border: 2px dashed #2d6293;
  background-color: white;
  padding-bottom: 8px;
  color: black;
  cursor: pointer;
}
.swimlane.new h2:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.swimlane .list-title {
  text-align: left;
  background-color: #2d6293;
  color: white;
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 0;
}
.swimlane input {
  width: 70%;
}

.task.new .list-title {
  border: 1px solid #eee;
  font-size: 12px;
  padding: 8px;
  width: 272px;
  font-weight: normal;
  color: #777;
  cursor: pointer;
  background-color: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  transition: box-shadow 0.5s ease, opacity 0.5s ease;
}
.task.new .list-title:hover {
  color: rgb(48, 48, 48);
  cursor: pointer;
}

.task.show-hidden {
  font-size: 12px;
  padding: 4px;
  margin-top: 4px;
  width: 100%;
  font-weight: normal;
  color: #777;
  cursor: pointer;
  background-color: #e5e5e5;
  border-radius: 2px;
}

@media (max-width: 600px) {
  .task.new .list-title {
    width: auto;
  }
}

.list-name-wrapper {
  padding: 5px;
}

.list-name {
  display: inline-block;
  margin-left: 4px;
}

@media (max-width: 600px) {
  .list-name {
    width: 280px;
    display: inline-block;
    margin-left: 4px;
  }
}

.list-name:hover {
  /* background-color: #323742; */
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.list-header {
  flex: 0;
}

.tasks {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
.list-edit {
  width: 100%;
}

.list-edit input {
  background-color: white;
  padding: 9px;
  margin-bottom: 1px;
  margin-top: 0;
}

.list-edit .v-btn {
  width: 32px;
  margin-top: 0;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0;
}

.flex-container-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex0 {
  flex: 0;
}

.flex1 {
  flex: 1;
}

@media (min-width: 601px) {
  .tracks {
    min-height: 400px;
  }
}

.track {
  margin-top: 6px;
  margin-bottom: 6px;
}
.track h2 {
  text-align: left;
  background-color: #2d6293;
  color: white;
  font-weight: normal;
  font-size: 14px;
  padding: 5px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 0;
}

.drag-image .track {
  width: 272px;
}
</style>
