<template>
  <div class="projects-page">
    <new-project ref="newProject"></new-project>  
    <new-project-group ref="newProjectGroup"></new-project-group>  
    <projects></projects>
    <md-speed-dial class="absolute-right" md-direction="top" md-event="click">
      <md-speed-dial-target class="md-primary">
        <md-icon class="md-morph-initial">add</md-icon>
        <md-icon class="md-morph-final">close</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="$refs.newProjectGroup.open()">
          <md-icon>folder</md-icon>
          <md-tooltip md-delay="300" md-direction="left">Nouvelle catégorie</md-tooltip>
        </md-button>

        <md-button class="md-icon-button" @click="$refs.newProject.open()">
          <md-icon>list_alt</md-icon>
          <md-tooltip md-delay="300" md-direction="left">Nouveau projet</md-tooltip>
        </md-button>

      </md-speed-dial-content>
    </md-speed-dial>
  </div>
</template>

<script>
export default {
  beforeMount () {
    this.$events.listen('projects-loaded', () => {
      this.recalculateTabsHeight();
    });
    let self = this;
    this.$nextTick(function() {
      window.addEventListener("resize", function(e) {
        self.windowWidth = window.innerWidth;
      });
    });
  },
  beforeDestroy() {
    this.$events.off('projects-loaded');
  },
  computed:{
      tabAlignment(){
        return this.windowWidth > 600 ? "left" : "fixed";
      }
  },

  data () {
    return {
      windowWidth: window.innerWidth
    }
  },
  methods: {
    recalculateTabsHeight () {
      window.setTimeout(() => {
        this.$nextTick(() => {
          if (this.$refs && this.$refs.tabs) {
            this.$refs.tabs.calculateTabPos();
          }
        });
      }, 100);      
    }
  },
  meteor: {
  },
}
</script>

<style scoped>
</style>