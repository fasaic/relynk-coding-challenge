import SensorDataModel from '../models/sensorData.js'
import moment from 'moment'

//! POST REQUEST FOR RECEIVING SENSOR DATA --------

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


// ! GET DATA -------------------------

const getAll = async (req, res) => {
  console.log(req.query)
  
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

export default {
  getAll,
  create,
}
