import moment from 'moment';

export default {
  methods: {
    formatDate (date) {
      if (!date) return;
      return moment(date).format('DD/MM/YYYY');
    },
    formatDateTime (date) {
      if (!date) return;
      return moment(date).format('DD/MM/YYYY HH:mm');
    },
    formatDateDuration (date, prefix) {
      var now = moment();
      var noteDate = moment(date);
      var duration = moment.duration(now.diff(noteDate)).locale('fr');
      if (!prefix) {
        prefix = "dans"
        if (duration > 0) {
          prefix = 'il y a'
        }
      }
      return `${prefix} ${duration.humanize()}`;
      
    }
  }
}