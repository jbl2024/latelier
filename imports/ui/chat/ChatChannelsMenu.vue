<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template v-slot:activator="{ on }">
      <v-btn dark block tile v-on="on">Conversations</v-btn>
    </template>
    <v-card>
      <v-list>
        <v-list-item @click="() => {}">
          <v-list-item-title>Général</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-item
          @click="goToChannel(channel)"
          v-for="(channel, index) in channels"
          :key="index"
        >
          <v-list-item-title>{{channel.label}}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
<script>
export default {
  computed: {
    channels() {
      return [
        { label: "Enora", link: "/channel/enora" },
        { label: "Test", link: "/channel/test" }
      ];
    }
  },
  methods: {
    goToChannel() {
      console.log("test");
    }
  }
};
</script>