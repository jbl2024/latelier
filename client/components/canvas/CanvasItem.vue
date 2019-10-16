<template>
  <div class="canvas-item">
    <v-card class="canvas-container">
      <v-card-title primary-title>
        <div>
            <div class="canvas-title" slot="activator">
              {{ title }}
            </div>
            <div class="canvas-headline">
              <slot name="headline"></slot>
            </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div
          v-if="!editContent"
          @click="startUpdateContent"
          class="content ql-editor-view"
          v-html="linkifyHtml(content)"
        ></div>
        <div v-if="editContent" class="edit-content">
          <rich-editor autofocus v-model="content" @submit="updateContent"></rich-editor>
          <v-btn icon text @click.native="updateContent">
            <v-icon>mdi-check-circle</v-icon>
          </v-btn>
          <v-btn icon text @click.native="cancelUpdateContent">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import TextRenderingMixin from "/imports/ui/mixins/TextRenderingMixin.js";

export default {
  mixins: [TextRenderingMixin],
  watch: {
    item: {
      immediate: true,
      handler(item) {
        this.content = item;
      }
    }
  },
  props: {
    title: {
      type: String,
      default: "title"
    },
    headline: {
      type: String,
      default: ""
    },
    item: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      content: "",
      savedContent: "",
      editContent: false
    };
  },
  methods: {
    startUpdateContent() {
      this.editContent = true;
      this.savedContent = this.content;
    },
    updateContent() {
      this.$emit("update:item", this.content);
      this.$emit("save");
      this.editContent = false;
    },
    cancelUpdateContent() {
      this.editContent = false;
      this.content = this.savedContent;
    }
  }
};
</script>

<style scoped>

.canvas-container {
  display: flex;
  flex-direction: column;
  border: 4px solid black;
}
.canvas-title {
  font-size: 18px;
}

.canvas-headline {
  font-size: 13px;
  line-height: 16px;
  padding-top: 12px;
  border-radius: 4px;
  flex: 0;
}

.content {
  width: 100%;
  cursor: text;
  flex: 1;
  min-height: 64px;
  border: 1px solid #eee;
}
.edit-content {
  min-height: 180px;
}
</style>