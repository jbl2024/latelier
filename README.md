# latelier

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjbl2024%2Flatelier.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjbl2024%2Flatelier?ref=badge_shield) [![Build Status](https://cloud.drone.io/api/badges/jbl2024/latelier/status.svg?ref=refs/heads/master)](https://cloud.drone.io/jbl2024/latelier) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/404a011df8c04d219242ef80d1c26397)](https://www.codacy.com/manual/jbl2024/latelier?utm_source=github.com&utm_medium=referral&utm_content=jbl2024/latelier&utm_campaign=Badge_Grade)

A project management tool.

![Kanban](/docs/kanban.png)

## Features

- [Kanban](<https://en.wikipedia.org/wiki/Kanban_(development)>) task board with realtime updates
- Timeline view of tasks and projects
- [BPMN](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation) diagrams
- [Business model canvas](https://en.wikipedia.org/wiki/Business_Model_Canvas) sheet for project
- Projects grouped by organization
- Project weather like status
- Permissions per organization & per project

## Installation

### Docker

Since v2.9.0, Docker images are available on docker hub: https://hub.docker.com/r/jbl2024/latelier .

A [docker-compose.yml](/docker-compose.yml) is also provided.

### Meteor

This application is built with [Meteor](https://www.meteor.com/) framework.

See https://www.meteor.com/install for installation instructions.

### Requirements

The following external dependencies are required:

| Component         | Usage                 | Reference       |
| ----------------- | --------------------- | --------------- |
| GraphicsMagick    | Generate thumbnails   | http://www.graphicsmagick.org/ |
| Pandoc            | Export content to libreoffice & word formats | https://pandoc.org/ |


### Configuration

Copy `settings-development.json.sample.json` to `settings-development.json` and update values matching your configuration

Settings:

| Key                            | Type     | Default value   | Description                                      |
| ------------------------------ | -------- | --------------- | ------------------------------------------------ |
| generateFixtures               | boolean  | false           | If true, users fixtures are generated at startup |
| disableAccountCreation         | boolean  | false           | If true account creation is forbidden            |
| attachmentsPath                | string   | /tmp/           | Attachment storage path on fs                    |
| avatarsPath                    | string   | attachmentsPath | Avatar storage path on fs                        |
| email                          | object   |                 | Email settings                                   |
| roles.admin                    | [string] | []              | Users matching emails will have the admin role   |
| public.seo.titlePrefix         | string   | l'atelier       | window.title prefix                              |
| public.sso                     | object   | {}              | See below                                        |
| public.emailVerificationNeeded | boolean  | false           | If false, no verification email is sent          |
| public.disableAttachments      | boolean  | false           | If true, attachments are disabled                |
| public.tracking                | object   | {}              | See below                                        |
| public.tracking.matomo         | object   | {}              | See https://github.com/AmazingDreams/vue-matomo#usage                    |
| public.tracking.matomo.enabled | boolean  | false           | If true, page and search keyword tracking are enabled|
| uploadTransport                | string   | ddp             | http or ddp                                      |
| notificationsPerUser           | number   | 50              | max number of notifications stored per user      |
| users                          | object   | {}              | See below                                        |
| elasticApm                     | object   | {}              | See below                                        |
| digestsRetention               | number   | 60              | Number of days to keep in digest                 |
| storage                        | object   | {}              | Storage. If empty, fs is used                    |
| auth                           | object   | {}              | See below                                        |
| coedition                      | object   | {}              | See below                                        |

email:

| Key    | Type   | Default value     | Description                  |
| ------ | ------ | ----------------- | ---------------------------- |
| from   | string | noreply@localhost | From email when sending mail |
| prefix | string |                   | Subject prefix               |

users:

| Key    | Type                    | Default value | Description                   |
| ------ | ----------------------- | ------------- | ----------------------------- |
| search | string ("admin", "all") | all           | Who can search existing users |
| invite | string ("admin", "all") | all           | Who can invite people         |

sso:

| Key     | Type    | Default value | Description                |
| ------- | ------- | ------------- | -------------------------- |
| enabled | boolean | false         | If true, sso is enabled    |
| email   | string  | null          | email header to match user |

elasticApm:

| Key     | Type    | Default value | Description                                         |
| ------- | ------- | ------------- | --------------------------------------------------- |
| enabled | boolean | false         | If true, elastic-apm is enabled                     |
| options | object  | {}            | see https://github.com/kschingiz/meteor-elastic-apm |

storage:

| Key           | Type          | Default value | Description                                                                                            |
| ------------- | ------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| type          | string ("s3") |               | Storage type                                                                                           |
| migrateFromFS | boolean       | false         | If true, files are moved from FS to storage system at startup (make sure you backup your data before!) |
| s3            | object        | {}            | s3 options                                                                                             |

s3

| Key      | Type   | Default value | Description            |
| -------- | ------ | ------------- | ---------------------- |
| endpoint | string |               | Storage url (optional) |
| key      | string |               | key                    |
| secret   | string |               | secret                 |
| region   | string |               | region                 |
| bucket   | string |               | bucket                 |

auth:

| Key    | Type   | Default value | Description |
| ------ | ------ | ------------- | ----------- |
| oauth2 | object | {}            | See below   |

oauth2:

| Key                     | Type    | Default value | Description                                               |
| ----------------------- | ------- | ------------- | --------------------------------------------------------- |
| enabled                 | boolean | false         | If true, oauth2 is enabled                                |
| title                   | string  | OAuth2        | Button title                                              |
| idMap                   | string  |               | id map                                                    |
| usernameMap             | string  |               | preferred_username                                        |
| fullnameMap             | string  |               | given_name                                                |
| emailMap                | string  |               | email                                                     |
| clientId                | string  |               | <Keycloak create Client ID>                               |
| secret                  | string  |               | <Keycloak Client secret>"                                 |
| serverUrl               | string  |               | <Keycloak server name>/auth                               |
| authEndpoint            | string  |               | /realms/<keycloak realm>/protocol/openid-connect/auth     |
| userInfoEndpoint        | string  |               | /realms/<keycloak realm>/protocol/openid-connect/userinfo |
| tokenEndpoint           | string  |               | /realms/<keycloak realm>/protocol/openid-connect/token    |
| logoutUrl               | string  |               | /realms/l<keycloak realm>/protocol/openid-connect/logout  |
| logoutRedirectParameter | string  |               | redirect_uri                                              |
| idTokenWhitelistFields  | string  |               | []                                                        |

Note: tested only with [keycloak](https://www.keycloak.org/).

coedition:

| Key                     | Type     | Default value   | Description                                            |
| steps                   | integer  | 500             | Number of steps to keep for coedit collab feature      |
| daysToKeep              | integer  | 3               | previous edition steps are removed after daysToKeep    |


Example:

```
{
  "generateFixtures": false,
  "disableAccountCreation": false,
  "attachmentsPath": "/tmp/attachments/",
  "notificationsPerUser": 50,
  "users": {
    "search": "admin",
    "invite": "admin"
  },
  "email": {
    "from": "noreply@localhost"
  },
  "roles": {
    "admin": ["foo@bar.com"]
  },
  "public": {
    "emailVerificationNeeded": false,
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

If `generateFixtures` parameter is set to true, 50 users are created at startup (if user count is <= 2).
Default password for generated users is `password`.

### Install dependencies

`meteor npm install`

### Start

`npm start`

### Docker development environment

A Dockerfile and a docker-compose are provided to start a development environment.

```
$ docker-compose --file docker-compose.dev.yml up
```

will start in dev mode (autorestart, no production build):

- the app container with node & meteor
- mongodb (latest)
- mongoexpress (http://localhost:8081)
- maildev (http://localhost:1080)

When all containers are running, open another terminal to start meteor application:

```
$ docker-compose --file docker-compose.dev.yml exec app npm run start-dev
```

After a few minutes, the app will be available at http://localhost

Note: do not forget to create a `settings-development.json` file.

### Screenshots

![Dashboard](/docs/task.png)

![Dashboard](/docs/dashboard.png)

![Planning (organization)](/docs/planning1.png)

![Planning (project)](/docs/planning2.png)

![BPMN](/docs/bpmn.png)

![Weather](/docs/weather.png)

![Canvas](/docs/canvas.png)

### License

Apache License 2.0

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjbl2024%2Flatelier.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjbl2024%2Flatelier?ref=badge_large)
