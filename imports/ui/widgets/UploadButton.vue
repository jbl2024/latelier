<template>
  <div>
    <slot :on="{click: beginUpload}">
      <v-btn dark @click="beginUpload">
        <v-icon left color="white">
          mdi-plus
        </v-icon>
        {{ $t("attachments.importAttachments") }}
      </v-btn>
    </slot>
    <input
      v-if="!isUploading"
      ref="uploadInput"
      style="display: none;"
      type="file"
      multiple
      :disabled="isUploading"
      @change="onUpload"
    >
  </div>
</template>
<script>
export default {
  props: {
    isUploading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    beginUpload() {
      this.$refs.uploadInput.click();
    },
    onUpload(e) {
      const files = e.target.files || [];
      for (let i = 0; i < files.length; i++) {
        this.$emit("on-upload", files[i]);
      }
    }
  }
};
</script>
