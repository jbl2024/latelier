<template>
  <div class="meetings-list-header">
    <div>
      {{ $tc("meetings.meetingsCount", meetings.length, { count: meetings.length }) }}
    </div>
    <v-menu bottom left class="menu">
      <template v-slot:activator="{ on }">
        <v-btn small icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$emit('add-new-meeting')">
          <v-list-item-action>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-action>
          <v-list-item-title>
            {{ $t("meetings.newMeeting") }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
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
  }
};
</script>
<style lang="scss">
  .meetings-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
</style>
