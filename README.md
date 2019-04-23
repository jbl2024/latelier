# latelier

A project management tool.

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

| Key                   | Type          | Description
|-----------------------|---------------|--------------------------|
|generateFixtures       | boolean       | If true, users fixtures are generated at startup |
|disableAccountCreation | boolean       | If true account creation is forbidden |
|attachmentsPath        | string        | Attachment storage path on fs |
|email.from             | string        | From email when sending mail |
|roles.admin            | [string]      | Users matching emails will have the admin role |
|public.seo.titlePrefix | string        | window.title prefix |
|sso                    | object        | See below |
|uploadTransport        | string        | http or ddp |


sso:

| Key                   | Type          | Description
|-----------------------|---------------|--------------------------|
| enabled               | boolean       | If true, sso is enabled |
| email                 | string        | email header to match user |


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

### Install dependencies

```meteor npm install ```

### Start

```npm start```

### License

Apache License 2.0