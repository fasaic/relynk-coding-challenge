import express from 'express'
import sensorDataController from './controller/sensorDataController.js'

const router = express.Router()
router.route('/').get((req, res) => res.status(200).send({ message: 'API is Running' }))

router
  .route('/api')
  .post(sensorDataController.create)
  .get(sensorDataController.getAll)

export default router