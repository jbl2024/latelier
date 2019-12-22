<template>
  <div class="project-bpmn">
    <new-workshop
      ref="newWorkshop"
      :project-id="projectId"
    />
    <edit-workshop ref="editWorkshop" />
    <div v-if="!$subReady.workshops">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.workshops">
      <empty-state
        v-show="workshops.length == 0"
        class="empty"
        rounded
        illustration="empty"
        :label="$t('No workshop')"
        :description="$t('You can add a new workshop')"
      >
        <v-btn class="primary" @click="newWorkshop()">
          {{ $t("Add workshop") }}
        </v-btn>
      </empty-state>

      <v-list v-show="workshops.length > 0" two-line subheader>
        <v-subheader>
          {{ $t("Workshops") }}
          <v-btn icon dark small color="primary" @click="newWorkshop()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-subheader>
        <v-list-item
          v-for="workshop in workshops"
          :key="workshop._id"
          @click="openWorkshop(workshop)"
        >
          <v-list-item-avatar>
            <v-icon>mdi-voice</v-icon>
          </v-list-item-avatar>

          <v-list-item-content class="pointer">
            <v-list-item-title>{{ workshop.name }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ htmlToText(workshop.description) }}
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.stop="editWorkshop(workshop)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Edit") }}</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.stop="cloneWorkshop(workshop)"
                >
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Clone") }}</span>
            </v-tooltip>
          </v-list-item-action>
          <v-list-item-action>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  text
                  color="grey darken-1"
                  v-on="on"
                  @click.stop="deleteWorkshop(workshop)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("Delete") }}</span>
            </v-tooltip>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Workshops } from "/imports/api/workshops/workshops";
import EditWorkshop from "/imports/ui/workshops/EditWorkshop.vue";
import NewWorkshop from "/imports/ui/workshops/NewWorkshop.vue";

import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import * as htmlToText from "html-to-text";

export default {
  components: {
    EditWorkshop,
    NewWorkshop
  },
  mixins: [TextRenderingMixin],
  props: {
    projectId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      modeler: null
    };
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", null);
  },
  meteor: {
    // Subscriptions
    $subscribe: {
      workshops: function() {
        return [this.projectId];
      }
    },
    workshops() {
      return Workshops.find(
        {},
        {
          sort: { name: 1 }
        }
      );
    },
    project() {
      return Projects.findOne();
    }
  },
  methods: {
    newWorkshop() {
      this.$refs.newWorkshop.open();
    },

    openWorkshop(workshop) {
      this.$router.push({
        name: "project-bpmn-process-diagram",
        params: {
          projectId: this.projectId,
          workshopId: workshop._id
        }
      });
    },

    deleteWorkshop(workshop) {
      this.$confirm(this.$t("Delete diagram?"), {
        title: workshop.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Delete")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "workshops.remove",
            { workshopId: workshop._id },
            (error) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Diagram deleted"));
            }
          );
        }
      });
    },

    editWorkshop(workshop) {
      this.$refs.editWorkshop.open(workshop);
    },

    cloneWorkshop(workshop) {
      this.$confirm(this.$t("Clone diagram?"), {
        title: workshop.name,
        cancelText: this.$t("Cancel"),
        confirmText: this.$t("Clone")
      }).then((res) => {
        if (res) {
          Meteor.call(
            "workshops.clone",
            { workshopId: workshop._id },
            (error) => {
              if (error) {
                this.$store.dispatch("notifyError", error);
                return;
              }
              this.$store.dispatch("notify", this.$t("Diagram cloned"));
            }
          );
        }
      });
    },

    htmlToText(html) {
      return htmlToText.fromString(html);
    }
  }
};
</script>

<style scoped>
.empty {
  margin-top: 24px;
}
</style>
