import linkifyHtml from "linkifyjs/html";

export default {
  methods: {
    linkifyHtml(text) {
      if (!text) {
        return null;
      }
      const taskUrl = Meteor.absoluteUrl("/tasks/");

      text = text.replace(
        /(^|\s)#(\d+)(\s|$)/g,
        `$1<a class="task-number" href="${taskUrl}$2">#$2</a>$3`
      );
      return linkifyHtml(text);
    }
  }
};
