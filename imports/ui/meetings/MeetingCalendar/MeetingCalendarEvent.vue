<template>
  <div v-if="event" :class="['event', displayType]" @contextmenu.stop>
    <div
      v-if="displayType !== 'month'"
      class="event__sidebar"
    >
      <v-btn
        icon
        rounded
        x-small
        @click.stop="moveUp"
      >
        <v-icon :color="iconColor">
          mdi-chevron-up
        </v-icon>
      </v-btn>
      <v-btn
        icon
        rounded
        x-small
        @click.stop="moveDown"
      >
        <v-icon :color="iconColor">
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </div>
    <div class="event__container">
      <div class="event__content">
        <div class="event__name">
          {{ eventName }}
        </div>
        <div
          v-if="event.project && event.project.name"
          class="event__project-name"
        >
          <v-chip
            v-if="event.project.color"
            :color="event.project.color"
            class="event__project-chip"
            x-small
          >
            <span :style="{color: projectTextColor}">
              {{ event.project.name }}
            </span>
          </v-chip>
        </div>
        <b class="event__hours">
          {{ displayEventHours(event) }}
        </b>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
import { colors } from "/imports/colors";
import { truncate } from "/imports/ui/utils/truncate";

export default {
  props: {
    event: {
      type: Object,
      default: null
    },
    displayType: {
      type: String,
      default: "week"
    }
  },
  computed: {
    projectTextColor() {
      if (!this.event?.project?.color) return "black";
      return colors.isDark(this.event.project.color) ? "white" : "black";
    },
    iconColor() {
      return colors.isDark(this.event.color) ? "white" : "black";
    },
    eventName() {
      if (!this.event?.name) return "";
      if (this.displayType === "day") return this.event.name;
      return truncate(this.event.name, this.displayType === "month" ? 10 : 20);
    }
  },
  methods: {
    truncate(str, maxLength) {
      return truncate(str, maxLength);
    },
    displayEventHours(event) {
      return `${moment(event.start).format("HH:mm")} - ${moment(event.end).format("HH:mm")}`;
    },
    moveUp() {
      this.$emit("move-up", this.event);
    },
    moveDown() {
      this.$emit("move-down", this.event);
    }
  }
};
</script>
<style lang="scss">
  .event {
    height: 100%;
    display: flex;
    position: relative;
    .event__container {
      padding: 4px;
      display: flex;
      align-items: center;
      word-break: break-word;
      flex: 1;
    }
    &.month {
      .event__container {
        padding: 0;
      }
      .event__content {
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: space-evenly;
      }
      .event__hours {
        font-size: 0.8em;
      }
    }

    .event__name {
      word-break: break-word;
    }
    .event__sidebar {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .event__project-chip {
      padding: 0px 3px;
      margin: 2px 0;
    }
    .event__project-name {
      word-break: break-word;
      font-size: 10px;
      display: flex;
      align-items: center;
    }
  }
</style>
