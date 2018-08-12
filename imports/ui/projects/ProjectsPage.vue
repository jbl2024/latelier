<template>
  <div class="projects-page">
    <new-project ref="newProject"></new-project>  
    <md-tabs :md-alignment="tabAlignment" ref="tabs">
      <md-tab id="tab-projects" md-label="Tous les projets">
        <projects></projects>
      </md-tab>

      <md-tab id="tab-groups" md-label="Groupes">
        <project-groups></project-groups>
      </md-tab>
    </md-tabs>

    <md-speed-dial class="absolute-right">
      <md-speed-dial-target @click="$refs.newProject.open()">
        <md-icon>add</md-icon>
      </md-speed-dial-target>
    </md-speed-dial>

  </div>
</template>

<script>
export default {
  mounted () {
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

.md-tab {
  background-color: #eee;
}
</style>