# oop-scheduler

This is the scheduling service for OpenInterop.

Schedules are configured using a cron-like syntax.

Valid scheduling fields are:
- `minute`
- `hour`
- `dayOfWeek`
- `dayOfMonth`
- `monthOfYear`
- `year`

These can be set to strings that align closely with cron syntax. Some valid strings are:
- `*`
- `*/5`
- `1-7`
- `5,10,15,20`
- `1-5,11,17/2`

The interpretation of these strings can lead to a few gotchas, for example, `*/55` in the `minute` field, will cause the schedule to be run on minute `0` and minute `55` of the hour, a value of `2-59/55` will cause it to run on minute `2` and minute `57` of the hour.

## Installation

- Ensure node is installed with version at least `10.16.2` LTS.
- Install `yarn` if necessary (`npm install -g yarn`).
- Run `yarn install` to install the node dependencies.
- Once everything is installed the service can be started with `yarn start`.

## Configuration

- `OOP_AMQP_ADDRESS`: The address of the AMQP messaging service.
- `OOP_EXCHANGE_NAME`: The message exchange for Open Interop.
- `OOP_ERROR_EXCHANGE_NAME`:  The exchange errors will be published to.
- `OOP_JSON_ERROR_Q`: The queue JSON decode messages will be published to.
- `OOP_CORE_API_URL`: The API URL for core which will be used to request authentication details.
- `OOP_CORE_TOKEN`: The API token for core.
- `OOP_SCHEDULER_OUTPUT_Q`: The queue this service will publish to when a schedule has run.

## Testing

`yarn test` to run the tests and generate a coverage report.

## Contributing

We welcome help from the community, please read the [Contributing guide](https://github.com/open-interop/oop-guidelines/blob/master/CONTRIBUTING.md) and [Community guidelines](https://github.com/open-interop/oop-guidelines/blob/master/CODE_OF_CONDUCT.md).

## Licence

Copyright (C) 2020 The Software for Health Foundation Limited <https://softwareforhealth.org/>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
