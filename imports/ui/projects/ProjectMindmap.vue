<template>
  <div>
    <div v-if="!$subReady.mindmap">
      <v-progress-linear indeterminate />
    </div>
    <div v-if="$subReady.mindmap" class="wrapper">
      <v-toolbar dense class="toolbar">
        <v-btn icon @click="gotoMindmaps()">
          <v-icon>mdi-sitemap</v-icon>
        </v-btn>
        <span class="title">{{ mindmap.name }}</span>
        <v-spacer />
        <tooltip-button
          icon="mdi-file-export"
          :tooltip="$t('Export XML')"
          @on="exportXML()"
        />
        <tooltip-button
          icon="mdi-image"
          :tooltip="$t('Export image')"
          @on="exportSVG()"
        />
        <template v-if="mode === 'view'">
          <tooltip-button
            icon="mdi-pencil"
            :tooltip="$t('Edit')"
            @on="edit()"
          />
        </template>
        <template v-if="mode === 'edit'">
          <tooltip-button
            icon="mdi-undo"
            :tooltip="$t('Undo')"
            @on="undo()"
          />
          <tooltip-button
            icon="mdi-redo"
            :tooltip="$t('Redo')"
            @on="redo()"
          />
          <tooltip-button
            icon="mdi-check"
            :tooltip="$t('Close')"
            @on="view()"
          />
        </template>
      </v-toolbar>
      <empty-state
        v-show="mode === 'view' && !mindmap.data"
        class="empty"
        illustration="empty"
        :label="$t('Empty map')"
      >
        <v-btn class="primary" @click="edit()">
          {{ $t("Start edition") }}
        </v-btn>
      </empty-state>

      <mindmap-editor
        v-if="mode === 'edit'"
        ref="modeler"
        :mindmap="mindmap"
        class="mindmap"
      />
    </div>
  </div>
</template>

<script>
import { Projects } from "/imports/api/projects/projects.js";
import { Mindmaps } from "/imports/api/mindmaps/mindmaps";
import MindmapEditor from "/imports/ui/mindmaps/MindmapEditor";
import { saveAs } from "file-saver";

export default {
  components: {
    MindmapEditor
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    mindmapId: {
      type: String,
      default: "0"
    }
  },
  data() {
    return {
      modeler: null,
      mode: "view"
    };
  },
  mounted() {
    this.$store.dispatch("setCurrentProjectId", this.projectId);
  },
  beforeDestroy() {
    this.$store.dispatch("setCurrentProjectId", null);
  },
  meteor: {
    $subscribe: {
      mindmap: function() {
        return [this.mindmapId];
      }
    },
    mindmap() {
      return Mindmaps.findOne();
    },
    project() {
      return Projects.findOne();
    }
  },
  methods: {
    edit() {
      this.mode = "edit";
    },
    view() {
      this.mode = "view";
    },
    undo() {
      this.$refs.modeler.undo();
    },

    redo() {
      this.$refs.modeler.redo();
    },

    exportSVG() {
      const cb = (err, svg) => {
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        saveAs(blob, `${this.mindmap.name}.svg`);
      };

      if (this.mode === "edit") {
        this.$refs.modeler.saveSVG(cb);
      } else {
        this.$refs.viewer.saveSVG(cb);
      }
    },

    exportXML() {
      const { xml } = this.mindmap;
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      saveAs(blob, `${this.mindmap.name}.xml`);
    },

    gotoMindmaps() {
      this.$router.push({
        name: "project-mindmaps",
        params: { projectId: this.projectId }
      });
    }
  }
};
</script>

<style scoped>
#canvas {
  height: 90vh;
}
.empty {
  margin-top: 24px;
}

.wrapper {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
}

.toolbar {
  flex: 0;
}

.mindmap {
  flex: 1;
}
</style>
