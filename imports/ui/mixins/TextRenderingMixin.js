import linkifyHtml from 'linkifyjs/html';

export default {
  methods: {
    linkifyHtml (text) {
      if (!text) {
        return;
      }
      return linkifyHtml(text);
    }
  }
}