import mongoose from 'mongoose'

const sensorDataSchema = new mongoose.Schema({
  Datetime: { type: Date, default: Date.now() },
  Value: { type: Number, required: true },
  Room: { type: String, required: true },
  Measurement: { type: String, required: true },
})

export default mongoose.model('sensor', sensorDataSchema)