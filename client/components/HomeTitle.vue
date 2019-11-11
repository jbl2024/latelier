<template>
  <div class="home-title">
    <v-toolbar-title class="align-left">
      <div>
        <slot />
        <v-btn
          text
          icon
          color="white"
          @click="$router.push({ name: 'dashboard-page' })"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <span class="title">L'atelier</span>
      </div>
    </v-toolbar-title>
  </div>
</template>

<script>

export default {
  data() {
    return {
    };
  }
};
</script>

<style scoped>
.home-title {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex: 2;
}

.align-left {
  flex: 1;
}

.align-remaining {
  flex: 1;
}

.title {
  position: relative;
  top: 3px;
}


</style>
