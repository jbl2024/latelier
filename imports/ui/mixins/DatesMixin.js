import moment from "moment";

export default {
  methods: {
    formatDate(date) {
      if (!date) return;
      return moment(date).format(this.$t("dates.format.date"));
    },
    formatDateTime(date) {
      if (!date) return;
      return moment(date).format(this.$t("dates.format.dateTime"));
    },
    formatDateDuration(date) {
      var now = moment();
      var noteDate = moment(date);
      var duration = moment.duration(now.diff(noteDate)).locale(this.$t("dates.locale"));
      if (duration > 0) {
        return this.$t("dates.duration.past", {
          duration: duration.humanize()
        });
      } else {
        return this.$t("dates.duration.future", {
          duration: duration.humanize()
        });
      }
    }
  }
};
