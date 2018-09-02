import showdown from 'showdown';

export default {
  methods: {
    markDown (text) {
      var converter = new showdown.Converter({
        type: 'lang',
        filter: function(text) {
            return text.replace(/^( *(\d+\. {1,4}|[\w\<\'\">\-*+])[^\n]*)\n{1}(?!\n| *\d+\. {1,4}| *[-*+] +|$)/gm, function(text) {
                return text.trim() + "  \n";
            })
          }
        }
      );
      return converter.makeHtml(text);
    }
  }
}