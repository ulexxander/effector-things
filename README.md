# Effector Things

Collection of hand-made [Effector](https://effector.dev/) packages to conveniently solve different application buisness-logic tasks.

Wrote those packages to easily reuse between different projects as well as to share with others.

Every single package will be eventually covered with unit-tests and published to npm (currently available only as a git repo).

This repository is a monorepo, uses **yarn workspaces** and keeps all of its code splitted into packages in `/packages` directory.

## Currently available:

- `@effector-things/forms` - structured and low-boilerplate form values, events, state, validation and errors
- `@effector-things/persist` - sync effector store in single line with any kind of storage and using any kind of data format (codec)

## Upcoming, not yet extracted:

- `@effector-things/forms-react` - bind/incapsulate form fields into react components to write less code and boost perfomance
- `@effector-things/time`
- `@effector-things/restapi`
- `@effector-things/router-dom` and `@effector-things/router-dom-react`
- `@effector-things/shortcuts`
- `@effector-things/uploads`

## Planned in future

- `@effector-things/bind`
- `@effector-things/graphql` (probably also with codegen plugin)
