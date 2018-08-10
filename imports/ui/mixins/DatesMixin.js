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
  }
}