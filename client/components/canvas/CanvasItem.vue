<template>
  <div class="canvas-item">
    <v-card>
      <v-card-title primary-title>
        <div>
          <div slot="activator" class="canvas-title">
            {{ title }}
          </div>
          <div class="canvas-headline">
            <slot name="headline" />
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div
          v-if="!editContent"
          class="content ql-editor-view"
          @click="startUpdateContent"
          v-html="linkifyHtml(content)"
        />
        <div v-if="editContent" class="edit-content">
          <rich-editor v-model="content" autofocus @submit="updateContent" />
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
  watch: {
    item: {
      immediate: true,
      handler(item) {
        this.content = item;
      }
    }
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
.canvas-title {
  font-size: 18px;
}

.canvas-headline {
  font-size: 12px;
  color: #546E7A;
  min-height: 90px;
}

.content {
  border: 1px solid #eee;
  width: 100%;
  min-height: 220px;
  cursor: text;
}
.edit-content {
  min-height: 220px;
}
</style>
