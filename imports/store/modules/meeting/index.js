import Api from "/imports/ui/api/Api";

export default {
  namespaced: true,
  state: {
    meetingsResults: null,
    meetingTypes: null,
    meetingRoles: null,
    selectedMeeting: null,
    selectedMeetingTypes: [],
    currentMeeting: null
  },
  mutations: {
    updateMeetingsResults(state, meetingsResults) {
      state.meetingsResults = meetingsResults;
    },
    updateMeetingTypes(state, meetingTypes) {
      state.meetingTypes = meetingTypes;
    },
    updateMeetingRoles(state, meetingRoles) {
      state.meetingRoles = meetingRoles;
    },
    updateSelectedMeetingTypes(state, selectedMeetingTypes) {
      state.selectedMeetingTypes = selectedMeetingTypes;
    },
    updateSelectedMeeting(state, selectedMeeting) {
      state.selectedMeeting = selectedMeeting;
    },
    updateCurrentMeeting(state, currentMeeting) {
      state.currentMeeting = currentMeeting;
    }
  },
  getters: {
    meetingsByProjectId: (state) => (projectId) => {
      if (!Array.isArray(state?.meetingsResults?.data)) return [];
      return state.meetingsResults.data.filter((meeting) => meeting.projectId === projectId);
    },
    filteredMeetingsByProjectId: (state, getters) => (projectId) => {
      const meetings = getters.meetingsByProjectId(projectId);
      return meetings.filter((meeting) => {
        if (!state.selectedMeetingTypes || !state.selectedMeetingTypes.length) return true;
        return state.selectedMeetingTypes.includes(meeting.type);
      });
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
    async fetchMeetingTypes(context) {
      const meetingTypes = await Api.call("meetings.getTypes");
      context.commit("updateMeetingTypes", meetingTypes);
    },
    async fetchMeetingRoles(context) {
      const meetingRoles = await Api.call("meetings.getRoles");
      context.commit("updateMeetingRoles", meetingRoles);
    },
    setSelectedMeeting(context, selectedMeeting) {
      context.commit("updateSelectedMeeting", selectedMeeting);
    },
    setSelectedMeetingTypes(context, selectedMeetingTypes) {
      context.commit("updateSelectedMeetingTypes", selectedMeetingTypes);
    }
  }
};
