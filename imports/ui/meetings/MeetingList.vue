<template>
  <v-card class="meeting-list">
    <v-list two-line>
      <template v-for="(day, dayIndex) in [`Aujourd'hui`, `Jeudi 4 juin 2020`]">
        <v-subheader :key="`subheader-${dayIndex}`" class="meeting-list__day-header">
          {{ day }}
        </v-subheader>
        <v-list-item-group
          :key="`group-${dayIndex}`"
          v-model="selected"
          multiple
          active-class="accent--text"
        >
          <template v-for="index in 4">
            <v-list-item :key="index">
              <template v-slot:default="{ active, toggle }">
                <v-list-item-content>
                  <v-list-item-title v-text="item.title" />
                  <v-list-item-subtitle class="text--primary" v-text="item.headline" />
                  <v-list-item-subtitle v-text="item.subtitle" />
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
      </template>
    </v-list>
  </v-card>
</template>
<script>
export default {
  data: () => ({
    selected: null,
    item: {
      title: "Point de la semaine",
      headline: "Lorem ipsum fluctua nec mergitur",
      subtitle: "Lorem ipsum fluctua nec mergitur. Lorem ipsum fluctua nec mergitur. Lorem ipsum fluctua nec mergitur. Lorem ipsum fluctua nec mergitur."
    }
  })
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
