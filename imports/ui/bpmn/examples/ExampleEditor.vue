<template>
  <div>
    <div class="wrapper">
      <v-toolbar dense class="toolbar" dark color="primary">
        <span class="title">{{ example.name }}</span>
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
        <template v-if="mode === 'view' && isAdmin()">
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
      <example-viewer
        v-if="mode === 'view' && example.xml"
        ref="viewer"
        :example="example"
        class="bpmn"
        @dblclick.native="edit()"
      />
      <empty-state
        v-show="mode === 'view' && !example.xml"
        class="empty"
        small
        illustration="empty"
        :label="$t('Empty diagram')"
      >
        <v-btn v-if="isAdmin()" class="primary" @click="edit()">
          {{ $t("Start edition") }}
        </v-btn>
      </empty-state>

      <example-modeler
        v-if="mode === 'edit'"
        ref="modeler"
        :example="example"
        class="bpmn"
      />
    </div>
  </div>
</template>

<script>
import { Permissions } from "/imports/api/permissions/permissions";
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";
import ExampleViewer from "./ExampleViewer";
import ExampleModeler from "./ExampleModeler";
import { saveAs } from "file-saver";

export default {
  components: {
    ExampleViewer: ExampleViewer,
    ExampleModeler: ExampleModeler
  },
  mixins: [TextRenderingMixin],
  props: {
    example: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      modeler: null,
      mode: "view"
    };
  },
  methods: {
    edit() {
      if (!this.isAdmin()) {
        return;
      }
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
        saveAs(blob, `${this.example.name}.svg`);
      };

      if (this.mode === "edit") {
        this.$refs.modeler.saveSVG(cb);
      } else {
        this.$refs.viewer.saveSVG(cb);
      }
    },

    exportXML() {
      const { xml } = this.example;
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      saveAs(blob, `${this.example.name}.xml`);
    },

    isAdmin() {
      return Permissions.isAdmin(Meteor.userId());
    }
  }
};
</script>

<style scoped>
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
  background-image: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
}

.toolbar {
  flex: 0;
}

.bpmn {
  flex: 1;
}
</style>
