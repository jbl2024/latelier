<template>
  <div class="projects-page">
    <new-project ref="newProject"></new-project>  
    <new-project-group ref="newProjectGroup"></new-project-group>  
    <md-tabs :md-alignment="tabAlignment" ref="tabs">
      <md-tab id="tab-projects" md-label="Tous mes projets">
        <projects></projects>
      </md-tab>

      <md-tab id="tab-groups" md-label="Groupes">
        <project-groups></project-groups>
      </md-tab>
    </md-tabs>

    <md-speed-dial class="absolute-right" md-direction="top" md-event="click">
      <md-speed-dial-target class="md-primary">
        <md-icon class="md-morph-initial">add</md-icon>
        <md-icon class="md-morph-final">close</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="$refs.newProjectGroup.open()">
          <md-icon>folder</md-icon>
          <md-tooltip md-delay="300" md-direction="left">Nouveau groupe</md-tooltip>
        </md-button>

        <md-button class="md-icon-button" @click="$refs.newProject.open()">
          <md-icon>list_alt</md-icon>
          <md-tooltip md-delay="300" md-direction="left">Nouveau projet</md-tooltip>
        </md-button>

      </md-speed-dial-content>
    </md-speed-dial>


    <!-- <md-speed-dial class="">
      <md-speed-dial-target @click="$refs.newProject.open()">
        <md-icon>add</md-icon>
      </md-speed-dial-target>
    </md-speed-dial> -->

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

.md-tab {
  background-color: #eee;
}
</style>