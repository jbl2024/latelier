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
    formatDateDuration (date) {
      var now = moment();
      var noteDate = moment(date);
      var duration = moment.duration(now.diff(noteDate)).locale('fr');
      return 'il y a ' + duration.humanize();
    }
  }
}