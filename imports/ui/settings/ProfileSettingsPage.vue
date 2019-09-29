<template>
  <div>
    <template v-if="user">
      <v-subheader>{{ $t("Profile")}}</v-subheader>

      <div class="elevation-1 card">
        <div class="center pa-8">
          <author-avatar big :user-id="user"></author-avatar>
        </div>
        <div class="pa-4">
          <input type="file" v-if="!isUploading" @change="onUpload" :disabled="isUploading" />
        </div>
        <div class="pa-4 center" v-if="user.profile.avatar">
          <v-btn text @click="remove()">{{ $t('Delete') }}</v-btn>
        </div>
        <v-divider></v-divider>
        <div class="center title pa-8">{{ user.emails[0].address }}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { Avatars } from "/imports/api/users/avatars";

export default {
  props: {},
  mounted() {
    this.refreshUser();
  },

  data() {
    return {
      user: null,
      isUploading: false
    };
  },
  methods: {
    refreshUser() {
      Meteor.call("users.getProfile", (error, result) => {
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.user = result;
      });
    },

    onUpload(e) {
      const file = e.target.files[0];
      this.uploadFile(file);
    },

    uploadFile(file) {
      const that = this;
      const transport = Meteor.settings.public.uploadTransport || "ddp";
      const upload = Avatars.insert(
        {
          file: file,
          streams: "dynamic",
          chunkSize: "dynamic",
          transport: transport,
          meta: {
            userId: Meteor.userId(),
            createdBy: Meteor.userId()
          }
        },
        false
      );

      upload.on("start", function() {
        that.isUploading = true;
      });

      upload.on("end", function(error, fileObj) {
        that.isUploading = false;
        if (error) {
          alert("Error during upload: " + error);
        } else {
          Meteor.call(
            "avatars.setAvatar",
            { avatarId: fileObj._id },
            (error, result) => {
              if (error) {
                that.$store.dispatch("notifyError", error);
                return;
              }
              that.refreshUser();
            }
          );
          that.file = null;
        }
      });
      upload.start();
    },

    remove() {
      Meteor.call(
        "avatars.clear",
        (error, result) => {
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.refreshUser();
        }
      );
    }
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  margin: 16px;
  max-width: 400px;
}
.title {
  font-size: 16px;
}
.center {
  text-align: center;
}
</style>