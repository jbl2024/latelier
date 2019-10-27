import linkifyHtml from "linkifyjs/html";

export default {
  methods: {
    linkifyHtml(text) {
      if (!text) {
        return null;
      }
      const taskUrl = Meteor.absoluteUrl("/tasks/");

      text = text.replace(
        /#(\d*)/g,
        `<a class="task-number" href="${taskUrl}$1">#$1</a>`
      );
      return linkifyHtml(text);
    }
  }
};
