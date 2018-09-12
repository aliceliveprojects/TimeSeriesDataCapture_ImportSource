# TimeSeriesDataCapture_ImportSource
Implementation of the ImportSource interface, described in TimeSeriesDataCapture 

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Building

### Prerequisites

#### MongoDB Database
see [MongoDB Hosting](https://github.com/CMDT/TimeSeriesDataCapture#mongodb-hosting) and [MongoDB Creation](https://github.com/CMDT/TimeSeriesDataCapture#mongodb-creation)

### Heroku
To build the Import API on heroku simply click the Deploy To Heroku button above

### Localhost
To build browse locally first the API [swagger.yaml](https://github.com/CMDT/TimeSeriesDataCapture_BrowseData/blob/master/src/BrowseAPI/api/swagger.yaml) file must be modified.

Locate the host on `Line 10` and change `host: <url>` to `host: "localhost:8000"`

Locate the schemes on `Line 16` and change `- "https"` to `-http`

To start server run:

```
node index.js
```


| Variable             | Example                                  | Description                              |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| DATABASE_URL         | *DATABASE URL*                           | this is the access url for the  MongoDB database. |
| DATABASE_USERNAME    | *DATABASE USERNAME*                      | this is the username for the  MongoDB database. |
| DATABASE_PASSWORD    | *DATABASE PASSWORD*                      | this is the password for the  MongoDB database. |
| DATABASE_NAME        | *DATABASE NAME*                          | this is the database name|
| DEBUG                | `*`                                      | Node debugging. Defines what components produce logging. Usually set to `*` |
| DISABLE_CLUSTERING   | true                                     | set to false to enable running on multiple cores. Currently set to true, because it's not yet tested. |
| PORT                 | 443                                      | Notionally, this variable is set to 443, but it simply exists as a placeholder for heroku. |
| SYSTEM_EXTERNAL_ID   | SYSTEM                                   | fbb69ea1-56ee-476d-be87-3360453bc7b5     |
| WEB_CONCURRENCY      | 4                                        | Number of cores to use.                  |
