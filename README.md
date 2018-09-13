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

## Environment Variables 

### Database
*Database URL*, *Database Username*, *Database Password* and *Database Name* can be all found within the mLab dashboard

*For help see [MongoDB](https://github.com/CMDT/TimeSeriesDataCapture#mongodb-hosting)*


| Variable             | Example                                  | Description                              |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| DATABASE_URL         | *DATABASE URL*                           | this is the access url for the  MongoDB database. |
| DATABASE_USERNAME    | *DATABASE USERNAME*                      | this is the username for the  MongoDB database. |
| DATABASE_PASSWORD    | *DATABASE PASSWORD*                      | this is the password for the  MongoDB database. |
| DATABASE_NAME        | *DATABASE NAME*                          | this is the database name|
| DEBUG                | `*`                                      | Node debugging. Defines what components produce logging. Usually set to `*` |
| DISABLE_CLUSTERING   | true                                     | set to false to enable running on multiple cores. Currently set to true, because it's not yet tested. |
| PORT                 | 443                                      | Notionally, this variable is set to 443, but it simply exists as a placeholder for heroku. |
| WEB_CONCURRENCY      | 4                                        | Number of cores to use.                  |


---

This project was funded via the [Marloes Peeters Research Group](https://www.marloespeeters.nl/) and mentored by [DigitalLabs@MMU](https://digitallabs.mmu.ac.uk/) as a [DigitalLabs Summer Project](https://digitallabs.mmu.ac.uk/what-we-do/teaching/). It is the work of [Yusof Bandar](https://github.com/YusofBandar).


<p align="center">
<img align="middle" src="https://trello-attachments.s3.amazonaws.com/5b2caa657bcf194b4d089d48/5b98c7ec64145155e09b5083/d2e189709d3b79aa1222ef6e9b1f3735/DigitalLabsLogo_512x512.png"  />
 </p>
 
 
<p align="center">
<img align="middle" src="https://trello-attachments.s3.amazonaws.com/5b2caa657bcf194b4d089d48/5b98c7ec64145155e09b5083/e5f47675f420face27488d4e5330a48c/logo_mmu.png" />
 </p>

