import Api from "/imports/ui/api/Api";

export default {
  namespaced: true,
  state: {
    meetingsResults: null,
    meetingRoles: null,
    selectedMeeting: null,
    currentMeeting: null
  },
  mutations: {
    updateMeetingsResults(state, meetingsResults) {
      state.meetingsResults = meetingsResults;
    },
    updateMeetingRoles(state, meetingRoles) {
      state.meetingRoles = meetingRoles;
    },
    updateSelectedMeeting(state, selectedMeeting) {
      state.selectedMeeting = selectedMeeting;
    },
    updateCurrentMeeting(state, currentMeeting) {
      state.currentMeeting = currentMeeting;
    }
  },
  actions: {
    async fetchMeetings(context, params) {
      const datas = await Api.call("meetings.findMeetings", params);
      context.commit("updateMeetingsResults", datas);
    },
    async fetchSelectedMeeting(context, params) {
      const meeting = await Api.call("meetings.get", params);
      context.commit("updateSelectedMeeting", meeting);
    },
    async fetchCurrentMeeting(context, params) {
      const meeting = await Api.call("meetings.get", params);
      context.commit("updateCurrentMeeting", meeting);
    },
    async fetchMeetingRoles(context) {
      const meetingRoles = await Api.call("meetings.getRoles");
      context.commit("updateMeetingRoles", meetingRoles);
    },
    setSelectedMeeting(context, selectedMeeting) {
      context.commit("updateSelectedMeeting", selectedMeeting);
    }
  }
};
