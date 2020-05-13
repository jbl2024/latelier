<template>
  <div class="home-title">
    <v-toolbar-title>
      <v-btn
        text
        icon
        color="white"
        @click="$emit('go-home')"
      >
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <span class="title">L'atelier</span>
    </v-toolbar-title>
  </div>
</template>
<style scoped>
.home-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.home-title .v-toolbar__title {
  display: flex;
  align-items: center;
}
</style>
