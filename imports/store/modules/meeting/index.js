import MeetingUtils from "/imports/api/meetings/utils";

export default {
  namespaced: true,
  state: {
    meetingsResults: null,
    meetingTypes: null,
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
    meetingsEventsByProjectId: (state, getters) => (projectId) => {
      const meetings = getters.meetingsByProjectId(projectId);
      return MeetingUtils.formatMeetingsAsEvents(meetings);
    },
    filteredMeetingsEventsByProjectId: (state, getters) => (projectId) => {
      const meetingsEvent = getters.meetingsEventsByProjectId(projectId);
      return meetingsEvent.filter((meetingEvent) => {
        if (!state.selectedMeetingTypes || !state.selectedMeetingTypes.length) return true;
        return state.selectedMeetingTypes.includes(meetingEvent.type);
      });
    }
  },
  actions: {
    async fetchMeetings(context, params) {
      const datas = await MeetingUtils.fetchMeetings(params);
      context.commit("updateMeetingsResults", datas);
    },
    async fetchSelectedMeeting(context, params) {
      const meeting = await MeetingUtils.fetchMeeting(params);
      context.commit("updateSelectedMeeting", meeting);
    },
    async fetchCurrentMeeting(context, params) {
      const meeting = await MeetingUtils.fetchMeeting(params);
      context.commit("updateCurrentMeeting", meeting);
    },
    async fetchMeetingTypes(context) {
      const meetingTypes = await MeetingUtils.fetchMeetingTypes();
      context.commit("updateMeetingTypes", meetingTypes);
    },
    setSelectedMeeting(context, selectedMeeting) {
      context.commit("updateSelectedMeeting", selectedMeeting);
    },
    setSelectedMeetingTypes(context, selectedMeetingTypes) {
      context.commit("updateSelectedMeetingTypes", selectedMeetingTypes);
    }
  }
};
