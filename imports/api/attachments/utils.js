import { Attachments } from "/imports/api/attachments/attachments";
import { Tasks } from "/imports/api/tasks/tasks.js";


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
    return Tasks.findOne({ _id: attachment.meta.taskId });
  }
};
