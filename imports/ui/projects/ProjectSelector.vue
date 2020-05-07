<template>
  <v-menu
    v-model="isMenuShown"
    :nudge-bottom="10"
    :close-on-content-click="false"
    @click-outside="isMenuShown = false"
    offset-y
  >
    <template v-slot:activator="{ on }">
      <slot name="activator" :on="on">
      </slot>
    </template>
    <v-card>
      <v-list>
        <v-list-item>  
          <v-list-item-content>
            <v-text-field v-model="filterProjects" :placeholder="$t('Search project')" solo hide-details>
            </v-text-field>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <search-projects :filter="filterProjects" @select="switchProject" auto-search/>
    </v-card>
  </v-menu>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      isMenuShown: false,
      filterProjects: "",
      favoritesOnly: false,
      projects: []
    }
  },
  computed: {
    ...mapState("project", ["currentProjectId"]),
    isSearching() {
      return this.filterProjects.length > 0;
    }
  },
  methods: {
    async switchProject(project) {
      if (!project || project._id && project._id === this.currentProjectId) return;
      this.isMenuShown = false;
      const routeName = this.$route.name.indexOf("project") === 0 ? this.$route.name : "project"
      await this.$router.push({ name: routeName, params: { projectId: project._id } });
    }
  }
}
</script>