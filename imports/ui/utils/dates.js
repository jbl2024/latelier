import moment from "moment";
import i18n from "/imports/i18n/";

export default {
  nowDate(format) {
    return moment().format(format || "YYYY-MM-DD");
  },
  formatDate(date, format = null) {
    if (!date) return null;
    return moment(date).format(format || i18n.t("dates.format.date"));
  },
  formatDateTime(date, format = null) {
    if (!date) return null;
    return moment(date).format(format || i18n.t("dates.format.dateTime"));
  },
  formatDateDuration(date) {
    const now = moment();
    const noteDate = moment(date);
    const duration = moment
      .duration(now.diff(noteDate))
      .locale(i18n.t("dates.locale"));
    if (duration > 0) {
      return i18n.t("dates.duration.past", {
        duration: duration.humanize()
      });
    }
    return i18n.t("dates.duration.future", {
      duration: duration.humanize()
    });
  },
  displayDateInterval({ start, end, dateFormat, type }) {
    const format = dateFormat || i18n.t("dates.format.prettyDate");
    const endDate = moment(end).format(format);
    const startDate = moment(start).format(format);
    switch (type) {
      case "month": {
        return moment(start).format(i18n.t("dates.format.prettyMonthAndDate"));
      }
      case "day": {
        return startDate;
      }
      default: {
        return i18n.t("dates.interval.date", { start: startDate, end: endDate });
      }
    }
  }
};
