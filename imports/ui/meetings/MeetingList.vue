<template>
  <v-card class="meeting-list">
    <v-list two-line>
      <v-list-item-group
        :key="`group-${dayIndex}`"
        v-model="selected"
        multiple
        active-class="accent--text"
      >
        <template v-for="meeting in meetings">
          <v-list-item :key="meeting._id">
            <template v-slot:default="{ active, toggle }">
              <v-list-item-content>
                <v-list-item-title v-text="meeting.name" />
                <v-list-item-subtitle v-if="meeting.description" v-text="meeting.description" />
              </v-list-item-content>
              <v-list-item-action>
                <v-icon
                  color="grey lighten-1"
                >
                  mdi-chevron-down
                </v-icon>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>
<script>
export default {
  props: {
    meetings: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      selected: []
    };
  }
};
</script>
<style lang="scss">
  .meeting-list {
    padding: 32pax;
    padding-top: 16px;
    &.v-card:not(.v-sheet--tile):not(.v-card--shaped) {
      border-radius: 0 0 9px 9px;
    }
    .meeting-list__day-header.v-subheader {
      font-size: 1.3rem;
      color: black;
    }
  }
</style>
