#  Costco ICS Service
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

A Costco employee portal scraper that gets the days you work and turns them into an ICS subscribe able calendar.
## Dependencies

- [NodeJS](https://nodejs.org/en/) - Runtime enviroment

- [MongoDB](https://www.mongodb.com/) - No SQL database
## API Reference

#### Get schedule

```http
  GET /<your ICS_SECRET env variable>
```


## Installation

1. Clone the project from github

```bash
git clone <repo link>
cd <repo name>
```

2. Install dependencies
```bash
npm i
```

3. Fill in the enviroment variables in `example.env`

4. Rename `example.env` to `.env`

5. Build the project and start it
```bash
npm run build
npm run start
```

5. You can also run the dev enviroment by running
```bash
npm run dev
```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`ICS_SECRET` Secret which will be used for the URL

`ICS_PORT` The port to run the server on

`COSTCO_USER` Costco employee username

`COSTCO_PASS` Costco employee password

`COSTCO_OTC` Costco employee one time code

`MONGO_URL` Connection string for the MongoDB database

`TZ` Local timezone for the costco

## FAQ

#### Why did you make this?

Costco's current calendar system could be faster and more manageable to check. If you'd like to view your schedule, you need to log in 3 times and navigate the poorly designed website, which needs to be optimized for mobile input.

This software allows users to subscribe to the Calendar on their preferred platform (Apple Calendar, Google Calendar, etc.) for seamless access. The software will also store canceled/changed shifts to ensure the user has all information.

#### Will I get in trouble for using this?

While this software is "use at your own risk," it's improbable that Costco will penalize you for using it since it doesn't do anything sketchy. Not only that, but I doubt Costco is monitoring their ancient employee website.

#### How do I subscribe to the calendar?

1. Go to your calendar software and look for an action called either "subscribe," "add calendar," or "import calendar."

2. Insert the following URL: `<server ip>:<ICS_PORT env variable>/<ICS_SECRET env variable>`

3. You're done.

#### The commands you wrote don't work

Make sure you have Git, NodeJS, and NPM installed.

## Authors

- [@PnsDev](https://www.github.com/PnsDev)
