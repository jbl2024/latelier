
export const makeProject = () => ({
  _id: "wqdWQjv5hhm8FRGu2",
  organizationId: null,
  name: "project1",
  state: "production",
  createdAt: "2020-11-26T10:34:21.948Z",
  createdBy: "itZF3eP7hSwgp46eu",
  accessRights: "organization",
  features: [
    "meetings",
    "bpmn",
    "weather",
    "canvas"
  ],
  deleted: false,
  members: [
    "itZF3eP7hSwgp46eu"
  ],
  color: "#F44336FF",
  description: "<p>project description</p>",
  startDate: "2020-11-26T00:00:00.000Z",
  endDate: "2020-11-30T00:00:00.000Z"
});

export const makeUsers = () => ({
  itZF3eP7hSwgp46eu: {
    _id: "itZF3eP7hSwgp46eu",
    emails: [
      {
        address: "user1@user.com",
        verified: false
      }
    ],
    profile: {
      firstName: "user1",
      lastName: "user1"
    }
  },
  moo6uojjufxGi5SXw: {
    _id: "moo6uojjufxGi5SXw",
    emails: [
      {
        address: "user2@gmail.com",
        verified: false
      }
    ]
  }
});

export const makeMetadatas = () => ({
  version: "V2020_11",
  createdAt: "2020-11-26T12:36:47.207Z",
  createdBy: {
    _id: "itZF3eP7hSwgp46eu",
    emails: [
      {
        address: "user1@user.com",
        verified: false
      }
    ],
    profile: null
  }
});


export const makeLabels = () => [
  {
    _id: "3se8hRBJuQyfj7D8q",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "label #1",
    color: "#9C27B0FF",
    createdAt: "2020-11-26T10:58:12.243Z",
    createdBy: "itZF3eP7hSwgp46eu"
  },
  {
    _id: "TPD3NkQWWaHxrZnr2",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "label #2",
    color: "#E53935FF",
    createdAt: "2020-11-26T10:58:20.827Z",
    createdBy: "itZF3eP7hSwgp46eu"
  },
  {
    _id: "Erng3ddaiW3cvANoH",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "label #3",
    color: "#004D40FF",
    createdAt: "2020-11-26T10:58:30.210Z",
    createdBy: "itZF3eP7hSwgp46eu"
  }
];

export const makeCanvas = () => ({
  _id: "C9PsX8stLsGzj9KgC",
  projectId: "wqdWQjv5hhm8FRGu2",
  createdAt: "2020-11-26T12:02:54.117Z",
  createdBy: "itZF3eP7hSwgp46eu",
  data: {
    goal: "<p>goal</p>",
    budget: "<p>budget</p>",
    team: "<p>team</p>",
    requirements: "<p>requirements</p>",
    resources: "<p>resources</p>",
    risks: "<p>risks</p>",
    milestones: "<p>milestones</p>",
    quality: "<p>quality</p>",
    outcome: "<p>outcome</p>",
    customers: "<p>customers</p>",
    planning: "<p>planning</p>"
  }
});

export const makeHealthReports = () => [
  {
    _id: "4EaDYMp9rswRzFuAA",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "report #1",
    description: "<p>description</p>",
    date: "2020-11-26T00:00:00.000Z",
    weather: "sunny",
    createdAt: "2020-11-26T12:08:27.578Z",
    createdBy: "itZF3eP7hSwgp46eu"
  },
  {
    _id: "9dvpSnMHDfLZKLxH8",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "report #2",
    description: "<p>description</p>",
    date: "2020-11-26T00:00:00.000Z",
    weather: "cloudy",
    createdAt: "2020-11-26T12:08:41.160Z",
    createdBy: "itZF3eP7hSwgp46eu"
  },
  {
    _id: "EHKXa6rfmF9b8eej2",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "report #3",
    description: "<p>description</p>",
    date: "2020-11-26T00:00:00.000Z",
    weather: "storm",
    createdAt: "2020-11-26T12:08:53.614Z",
    createdBy: "itZF3eP7hSwgp46eu"
  }
];

export const makeTasksLists = () => [
  {
    _id: "LzXt2kZJFnewnxnhj",
    name: "list #1",
    order: 1,
    autoComplete: false,
    catchCompleted: false,
    projectId: "wqdWQjv5hhm8FRGu2",
    createdAt: "2020-11-26T10:34:21.973Z",
    createdBy: "itZF3eP7hSwgp46eu",
    tasks: [
      {
        _id: "tkXPcBLXQ2rj7tzJ9",
        name: "task #1",
        order: 0,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "LzXt2kZJFnewnxnhj",
        completed: false,
        createdAt: "2020-11-26T10:34:29.647Z",
        updatedAt: "2020-11-26T12:33:20.334Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 1,
        labels: [],
        notes: [
          {
            _id: "78ezR8WgwRj2wik7F",
            createdAt: "2020-11-26T12:33:20.332Z",
            createdBy: "itZF3eP7hSwgp46eu",
            content: "<p>note #1</p>",
            edited: false
          }
        ],
        checklist: [
          {
            _id: "9fZfEx3eM5QTzhN69",
            createdAt: "2020-11-26T12:32:23.227Z",
            createdBy: "itZF3eP7hSwgp46eu",
            name: "item #1",
            checked: true
          },
          {
            _id: "j8JAe9G5dXzWL8iZR",
            createdAt: "2020-11-26T12:32:28.074Z",
            createdBy: "itZF3eP7hSwgp46eu",
            name: "item #2",
            checked: true
          },
          {
            _id: "nyMqD5wXsTuwp7JrE",
            createdAt: "2020-11-26T12:32:31.749Z",
            createdBy: "itZF3eP7hSwgp46eu",
            name: "item #3",
            checked: true
          },
          {
            _id: "qgz5Z7kqZYs2JGGuQ",
            createdAt: "2020-11-26T12:32:47.650Z",
            createdBy: "itZF3eP7hSwgp46eu",
            name: "unfinished item #4",
            checked: false
          }
        ],
        deleted: false,
        assignedTo: "itZF3eP7hSwgp46eu",
        description: "<p>description</p>"
      },
      {
        _id: "JryKsCPiiAiMu2PyE",
        name: "task #2",
        order: 10,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "LzXt2kZJFnewnxnhj",
        completed: false,
        createdAt: "2020-11-26T10:34:36.495Z",
        updatedAt: "2020-11-26T12:31:59.964Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 2,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false,
        assignedTo: "itZF3eP7hSwgp46eu",
        description: "<p>description</p>"
      },
      {
        _id: "ub8XYGZBbyLeoHJ6r",
        name: "action task",
        order: 20,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "LzXt2kZJFnewnxnhj",
        completed: false,
        createdAt: "2020-11-26T12:06:35.032Z",
        updatedAt: "2020-11-26T12:32:05.347Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 92,
        assignedTo: "itZF3eP7hSwgp46eu",
        dueDate: "2020-11-27T00:00:00.000Z",
        labels: [],
        notes: [],
        checklist: [],
        deleted: false,
        reminderDueDate: null,
        description: "<p>description</p>"
      },
      {
        _id: "azm7J2Hhon9ypX24N",
        name: "task #3",
        order: 30,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "LzXt2kZJFnewnxnhj",
        completed: false,
        createdAt: "2020-11-26T10:34:42.929Z",
        updatedAt: "2020-11-26T12:32:11.427Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [],
        number: 3,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false,
        description: "<p>description</p>"
      }
    ]
  },
  {
    _id: "29s2CeAGSxvnfoenh",
    name: "list #2",
    order: 2,
    autoComplete: false,
    catchCompleted: false,
    projectId: "wqdWQjv5hhm8FRGu2",
    createdAt: "2020-11-26T10:34:21.977Z",
    createdBy: "itZF3eP7hSwgp46eu",
    tasks: [
      {
        _id: "MbvGEJwK6hPZkfbxb",
        name: "task #4",
        order: 0,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "29s2CeAGSxvnfoenh",
        completed: false,
        createdAt: "2020-11-26T10:36:59.056Z",
        updatedAt: "2020-11-26T10:36:59.056Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 4,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false
      },
      {
        _id: "mF23GKwwSbNP8vMPQ",
        name: "task #5",
        order: 10,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "29s2CeAGSxvnfoenh",
        completed: false,
        createdAt: "2020-11-26T10:37:06.904Z",
        updatedAt: "2020-11-26T10:37:06.904Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 5,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false
      },
      {
        _id: "pYsmNFEXWfgHJdQCA",
        name: "task #6",
        order: 20,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "29s2CeAGSxvnfoenh",
        completed: false,
        createdAt: "2020-11-26T10:37:16.280Z",
        updatedAt: "2020-11-26T10:37:16.280Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 6,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false
      }
    ]
  },
  {
    _id: "waJTzPuPEzcKotQej",
    name: "completed list #3",
    order: 3,
    autoComplete: true,
    catchCompleted: true,
    projectId: "wqdWQjv5hhm8FRGu2",
    createdAt: "2020-11-26T10:34:21.983Z",
    createdBy: "itZF3eP7hSwgp46eu",
    tasks: [
      {
        _id: "r8wRZpRy38b7NZwHo",
        name: "task #7",
        order: 0,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "waJTzPuPEzcKotQej",
        completed: true,
        completedAt: "2020-11-26T11:47:02.194Z",
        createdAt: "2020-11-26T10:37:26.081Z",
        updatedAt: "2020-11-26T11:47:02.194Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 7,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false
      },
      {
        _id: "6TPPnKPndoqeb4XNs",
        name: "task #8",
        order: 10,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "waJTzPuPEzcKotQej",
        completed: true,
        completedAt: "2020-11-26T10:37:34.072Z",
        createdAt: "2020-11-26T10:37:32.656Z",
        updatedAt: "2020-11-26T10:37:34.072Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 8,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false
      },
      {
        _id: "8MEgNg3m5E3qRSDgm",
        name: "task #9",
        order: 20,
        projectId: "wqdWQjv5hhm8FRGu2",
        listId: "waJTzPuPEzcKotQej",
        completed: true,
        completedAt: "2020-11-26T10:37:40.801Z",
        createdAt: "2020-11-26T10:37:38.602Z",
        updatedAt: "2020-11-26T10:37:40.801Z",
        createdBy: "itZF3eP7hSwgp46eu",
        updatedBy: "itZF3eP7hSwgp46eu",
        watchers: [
          "itZF3eP7hSwgp46eu"
        ],
        number: 9,
        labels: [],
        notes: [],
        checklist: [],
        deleted: false
      }
    ]
  }
];

export const makeMeetings = () => [
  {
    _id: "zgF2WtF9ffpi2FuCp",
    projectId: "wqdWQjv5hhm8FRGu2",
    name: "meeting",
    state: "pending",
    description: "meeting description",
    color: "#F44336FF",
    startDate: "2020-11-26T13:00:00.000Z",
    endDate: "2020-11-26T14:00:00.000Z",
    attendees: [
      {
        attendeeId: "Q9iJPYMBZESMJQxnu",
        userId: "itZF3eP7hSwgp46eu",
        present: false,
        role: "attendee",
        email: "mahed69@gmail.com"
      }
    ],
    documents: [],
    actions: [
      {
        actionId: "i5Z6jizu6CpX6WXJb",
        type: "action",
        description: "action decision",
        dueDate: "2020-11-30T00:00:00.000Z",
        assignedTo: "itZF3eP7hSwgp46eu"
      },
      {
        actionId: "u6JrDJhmpKu2vBGTw",
        type: "action",
        description: "action task",
        dueDate: null,
        assignedTo: null,
        taskId: "ub8XYGZBbyLeoHJ6r"
      }
    ],
    createdAt: "2020-11-26T12:05:35.539Z",
    createdBy: "itZF3eP7hSwgp46eu",
    updatedAt: "2020-11-26T12:05:51.278Z",
    updatedBy: "itZF3eP7hSwgp46eu",
    deleted: false,
    type: "none",
    agenda: "<p>order</p>",
    report: "<p>compte-rendu</p>"
  }
];

export const makeProjectDatas = () => ({
  metadatas: makeMetadatas(),
  project: makeProject(),
  users: makeUsers(),
  tasksLists: makeTasksLists(),
  labels: makeLabels(),
  meetings: makeMeetings(),
  canvas: makeCanvas(),
  healthReports: makeHealthReports()
});
