import { Attachments } from "/imports/api/attachments/attachments";


export default {
  uploadFile(file, props, options = null) {
    options = options || {
      transport: Meteor.settings.public.uploadTransport || "ddp",
      streams: "dynamic",
      chunkSize: "dynamic"
    };
    return Attachments.insert(
      {
        file: file,
        streams: options.streams,
        chunkSize: options.chunkSize,
        transport: options.transport,
        meta: props?.meta ? props.meta : null
      },
      false
    );
  },
  getAttachmentName(attachment) {
    return attachment.name;
  },
  getAttachmentId(attachment) {
    return attachment._id;
  },
  link(attachment) {
    return Attachments.link(attachment);
  },
  hasTask(attachment) {
    return attachment?.meta?.taskId != null;
  },
  getTask(attachment) {
    if (!attachment?.meta?.taskId) return null;
    return attachment.meta.task;
  },
  getIconStyles(attachment) {
    /* isVideo|isAudio|isImage|isText|isJSON|isPDF */
    if (attachment.isPDF) {
      return {
        icon: "mdi-pdf-box",
        color: "red"
      };
    }
    if (attachment.isImage) {
      return {
        icon: "mdi-file-image",
        color: "brown"
      };
    }
    return {
      icon: "mdi-file-document",
      color: "blue"
    };
  }
};
