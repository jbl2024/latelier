# latelier

A project management tool.

![Kanban](/docs/kanban.png)

## Features

- [Kanban](https://en.wikipedia.org/wiki/Kanban_(development)) task board with realtime updates
- Timeline view of tasks and projects
- [BPMN](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation) diagrams
- [Business model canvas](https://en.wikipedia.org/wiki/Business_Model_Canvas) sheet for project
- Projects grouped by organization
- Project weather like status

## Installation

### Meteor

This application is built with [Meteor](https://www.meteor.com/) framework.

See https://www.meteor.com/install for installation instructions.

### Configuration

Copy `settings-development.json.sample.json` to `settings-development.json` and update values matching your configuration

Settings:

| Key                   | Type          | Default value            | Description              |
|-----------------------|---------------|--------------------------|--------------------------|
|generateFixtures       | boolean       | false                    | If true, users fixtures are generated at startup |
|disableAccountCreation | boolean       | false                    | If true account creation is forbidden |
|attachmentsPath        | string        | /tmp/                    | Attachment storage path on fs |
|email.from             | string        | noreply@localhost        | From email when sending mail |
|roles.admin            | [string]      | []                       | Users matching emails will have the admin role |
|public.seo.titlePrefix | string        | l'atelier                | window.title prefix |
|sso                    | object        | {}                       | See below |
|uploadTransport        | string        | ddp                      | http or ddp |
|notificationsPerUser   | number        | 50                       | max number of notifications stored per user |
|users                  | object        | {}                       | See below |

users:
| Key                   | Type          | Default value            | Description                    |
|-----------------------|---------------|--------------------------|--------------------------------|
| search                | string ("admin", "all") | all            | Who can search existing users  |
| invite                | string ("admin", "all") | all            | Who can invite people          |


sso:

| Key                   | Type          | Default value            | Description                |
|-----------------------|---------------|--------------------------|----------------------------|
| enabled               | boolean       | false                    | If true, sso is enabled    |
| email                 | string        | null                     | email header to match user |


Example:
```
{
  "generateFixtures": true,
  "disableAccountCreation": false,
  "attachmentsPath": "/tmp/attachments/",
  "email": {
    "from": "noreply@localhost"
  },
  "roles": {
    "admin": ["foo@bar.com"]
  },
  "public": {
    "seo": {
      "titlePrefix": "l'atelier"
    },
    "sso": {
      "enabled": true,
      "email": "header-email"
    },
    "uploadTransport": "ddp"
  }
}
```

### Fixtures (dev only feature)
 
If ```generateFixtures``` parameter is set to true, 50 users are created at startup (if user count is <= 2).
Default password for generated users is ```password```.


### Install dependencies

```meteor npm install ```

### Start

```npm start```

### Screenshots

![Dashboard](/docs/dashboard.png)

![Planning (organization)](/docs/planning1.png)

![Planning (project)](/docs/planning2.png)

![BPMN](/docs/bpmn.png)

![Weather](/docs/weather.png)

![Canvas](/docs/canvas.png)

### License

Apache License 2.0