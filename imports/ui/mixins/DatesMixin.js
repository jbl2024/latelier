import moment from 'moment';

export default {
  methods: {
    formatDate (date) {
      return moment(date).format('DD/MM/YYYY');
    },
    formatDateTime (date) {
      return moment(date).format('DD/MM/YYYY HH:mm');
    },
  }
}