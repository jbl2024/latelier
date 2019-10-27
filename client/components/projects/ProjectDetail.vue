<template>
  <div class="project-detail">
    <select-date
      :active.sync="showSelectStartDate"
      :disable-time="true"
      @select="onSelectStartDate"
    />
    <select-date
      :active.sync="showSelectEndDate"
      :disable-time="true"
      @select="onSelectEndDate"
    />
    <select-color :active.sync="showSelectColor" @select="onSelectColor" />

    <div class="toolbar">
      <div class="toolbar-button">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="requestClose()"
          @shortkey="requestClose()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="toolbar-title">
        <span class="project-name" v-html="linkifyHtml(project.name)" />
      </div>
    </div>
    <v-divider />
    <div
      v-if="project.description && project.description.length > 0"
      class="ql-editor-view description"
      v-html="linkifyHtml(project.description)"
    />
    <div
      v-if="!project.description || project.description.length == 0"
      class="ql-editor-view description"
    >
      {{ $t("No description") }}
    </div>
    <v-divider />

    <v-list two-line>
      <v-list-item @click="showSelectStartDate = true">
        <v-list-item-action>
          <v-icon>mdi-calendar-today</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t("Start date") }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-show="project.startDate">{{
              formatDate(project.startDate)
            }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showSelectEndDate = true">
        <v-list-item-action>
          <v-icon>mdi-alarm-check</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t("End date") }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-show="project.endDate">{{
              formatDate(project.endDate)
            }}</span>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item @click="showSelectColor = true">
        <v-list-item-content>
          <div ref="color" class="color" :style="getColor(project)" />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn text icon @click.stop="removeColor()">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-divider />

    <project-menu
      :organization-id="project.organizationId"
      :project-id="project._id"
    />
  </div>
</template>

<script>
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [TextRenderingMixin, DatesMixin],
  props: {
    active: Boolean,
    project: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      showSelectStartDate: false,
      showSelectEndDate: false,
      showSelectColor: false
    };
  },
  meteor: {},
  methods: {
    requestClose() {
      this.$emit("update:active", false);
    },
    onSelectStartDate(date) {
      Meteor.call(
        "projects.setStartDate",
        { projectId: this.project._id, startDate: date },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$emit("refresh");
        }
      );
    },

    onSelectEndDate(date) {
      Meteor.call(
        "projects.setEndDate",
        { projectId: this.project._id, endDate: date },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$emit("refresh");
        }
      );
    },

    onSelectColor(color) {
      const hex = color || "white";
      this.$refs.color.style.backgroundColor = hex;
      this.project.color = hex;
      Meteor.call(
        "projects.updateColor",
        { projectId: this.project._id, color: hex },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$emit("refresh");
        }
      );
    },

    removeColor() {
      this.project.color = "";
      Meteor.call(
        "projects.updateColor",
        { projectId: this.project._id, color: "" },
        (error) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.$emit("refresh");
        }
      );
    },

    getColor(project) {
      if (!project.color) {
        return "background-color: white";
      }
      return `background-color: ${project.color}`;
    }
  }
};
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 12px;
}

.toolbar-button {
  flex: 1;
  max-width: 42px;
  margin-left: 8px;
  margin-right: 8px;
}

.toolbar-title {
  flex: 2;
  font-size: 18px;
}

.menu {
  z-index: 10000;
}
.description {
  margin: 24px;
}

.actions {
  margin: 24px;
}

.color {
  height: 32px;
  width: 100%;
  border: 1px solid black;
}

pre {
  font-family: Roboto, Noto Sans, -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: pre-wrap;
}
</style>
