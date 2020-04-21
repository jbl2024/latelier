<template>
    <v-menu offset-y eager>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on">
        <span>Projet</span>
        <v-icon>mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="(project, i) in items" :key="i">
        <v-list-item-title>{{ project.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>