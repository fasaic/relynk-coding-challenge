import mongoose from 'mongoose'

const sensorDataSchema = new mongoose.Schema({
  datetime: { type: Date, default: Date.now() },
  value: { type: Number, required: true },
  room: { type: String, required: true },
  measurement: { type: String, required: true },
})

export default mongoose.model('sensor', sensorDataSchema)