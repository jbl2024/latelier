import AttachmentsUtils from "/imports/api/attachments/utils.js";

export default {
  methods: {
    addAttachment() {
      this.$emit("add-attachment");
    },
    getAttachmentName(attachment) {
      return AttachmentsUtils.getAttachmentName(attachment);
    },
    getAttachmentId(attachment) {
      return AttachmentsUtils.getAttachmentId(attachment);
    },
    link(attachment) {
      return AttachmentsUtils.link(attachment);
    },
    hasTask(attachment) {
      return AttachmentsUtils.hasTask(attachment);
    },
    getTask(attachment) {
      return AttachmentsUtils.getTask(attachment);
    },
    getIconStyles(attachment) {
      return AttachmentsUtils.getIconStyles(attachment);
    },
    async deleteAttachment(attachment) {
      try {
        const res = await this.$confirm(this.$t("Delete attachment?"), {
          title: attachment.name,
          cancelText: this.$t("Cancel"),
          confirmText: this.$t("Delete")
        });

        if (res) {
          await Meteor.callAsync("attachments.remove", { attachmentId: attachment._id });
          this.$notify(this.$t("attachments.removeSuccess"));
        }
      } catch (error) {
        this.$notifyError(error);
      }
    }
  }
};
