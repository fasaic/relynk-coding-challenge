# Relynk  Coding Challenge

## Description
The goal of this task is to write a program that can process, store, and query sensor data from multiple rooms, measurement types over different time periods and resolutions. To reach this goal, a backend using Node.js, Express, MongoDB that handles incoming post requests for storing sensor data, and get requests with different query parameters.

Timeframe: 4 days 

## Technology Used
- Node.js
- Express
- MongoDB
- Insomnia

## Running the server
To run the server, install all dependencies and packages then start the server by runnning `npm run server` in the terminal. After the server is running, this endpoint : ```http://localhost:4000/api``` can be used to make a get request through the browser or a tool such as Insomnia. 

## Endpoints

#### store sensor data
To post and store sensor data, it can be done by sending a `POST` request to `http://localhost:4000/api` with the data format as 
```
 {
    datetime: Date and time of measurement,
    measurement: Type of measurement (string format),
    room: room name (string),
    value: value of measurement (number)
 }
```

#### query for sensor data
To get sensor data, it can be done by sending a `GET` request to 

`http://localhsot:4000/api?startDate{datetime}&endDate{datetime}&room={room}&measuremen{measurement}`

The query parameters are optional, where `startDate` & `endDate` indicate the desired time-frame of the query `room` indicates the room name
`measurement` indicates the measurement type


## Planning
 The first session of working on this assessment was used for planning. The first approach taken was to plan the structure of the database and what tools to use. 
 
 Since the program is intended to handle data from real estate sensors, there are possibilities in the future that there might be new types of data and that the database has to be scaled. Therefore, MongoDB, a noSQl database was chosen for this application to be used with Node.js Javscript runtime. 

 The required endpoints and the architecture of the program were then planned out before starting the coding process. 


## Code Process

#### Model 
After establishing connection to the database, a mongoose schema was created to define the validations for the data. The default datetime is set to the date and time the request is sent.
```
import mongoose from 'mongoose'

const sensorDataSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now() },
  value: { type: Number, required: true },
  room: { type: String, required: true },
  measurement: { type: String, required: true },
})

export default mongoose.model('sensor', sensorDataSchema)
```

#### Controllers

#### POST request controller
The controllers were then created to handle requests. The first controller is for the `POST` request, where the sensor data will be created and stored in the database. Since the sample data indicates that the date-time format is `yyyy-mm-ddThh-mm-ssT`, it could not be handled as the standard date-time format therefore it has to be manipulated as the standard `yyyy-mm-ddThh-mm-ssZ` format. This was done by checking if the character of the datetime is `T` and changing it to `Z` to match the standard format. The date is then changed to UTC time using moment.js library to calibrate date and time from different timezones which were then formatted to ISO datetime. Error responses for wrong data type were also setup in this process.

```
const create = async (req, res, next) => {
  const { datetime, room, measurement, value } = req.body

  // Change the datetime format from YY-MM-DDThh-mm-ssT to YY-MM-DDThh-mm-ssZ
  let formattedDatetime = ''
  if (datetime) {
    formattedDatetime = datetime.slice(0, -1) + 'Z'
  }

  try {
    // Check and return type error
    if (isNaN(value)) {
      return res.status(422).json({ error: 'Value must be a number' })
    }

    if (typeof room !== 'string') {
      return res.status(422).json({ error: 'Room must be a string' })
    }

    if (typeof measurement !== 'string') {
      return res.status(422).json({ error: 'Measurement must be a string' })
    }

    const createdDocument = await SensorDataModel.create({
      // Convert to UTC datetime format to accept time from different timezones
      datetime: datetime ? moment(formattedDatetime).utc().format() : datetime, 
      room,
      measurement,
      value,
    })
    return res.status(200).json(createdDocument)
  } catch (error) {
    next(error)
  }
}
```


##### GET request controller
The second controller is to handle `GET` requests with different optional paremeters. This is done using `aggregate` where `$match` was used to filter the data by the request query. An error response is present where there are no data that matches the request query parameters.


```
const getAll = async (req, res) => {
  const { startDate, endDate, room, measurement, resolution } = req.query

  // use aggregation pipeline to filter the data by request query parameters
  const filteredSensorData = await SensorDataModel.aggregate([
    { $match: startDate ? { datetime: { $gte: new Date(moment(startDate).utc().format()) } } : {} },
    { $match: endDate ? { datetime: { $lte: new Date(moment(endDate).utc().format()) } } : {} },
    { $match: room ? { room: room } : {} },
    { $match: measurement ? { measurement: measurement } : {} }
  ])

  if (filteredSensorData.length < 1) {
    return res.status(400).json({ error: 'No match data found' })
  }

  return res.status(200).json(filteredSensorData)

}
```

## Challenges and Further Improvements
There are several challenges and features that had not been included in this stage of this challenge. 

*Data aggregation by time resolution*

This is my first time buidling a backend with data that must be able to be queried by specific time resolution. In the timeframe working with multiple optional request queries, and most importantly, grouping data by different time resolution intervals. I am in the process of learning more about the aggregation pipeline and how the date-time data can be manipulated and separated into different groups according to a specified time interval. I am aware that `$group` can be used to specify the index to be grouped by, and it is possible to create a new field such as `averageValue: { $avg: '$value' }` to average the sensor value in the group. However, I am still struggling to separte time into different intervals. I am currently learning more about this topic and will include them in the further imrovements.

```
        $group: {
          _id: {

          },
          averageValue: { $avg: '$value' },
        },
```

*Testing*

Testing is another parth that I have not done and is still in the learning process. I am planning to use Mocha testing framework and I would implement them in further improvements. 