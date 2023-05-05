// ! IMPORTS ------------
import express from 'express'
import logger from './middleware/logger.js'
import router from './router.js'
import errorHandler from './middleware/errorHandler.js'
import connectToDb from './utils/db.js'
import dotenv from 'dotenv'
import CONSTS from './consts.js'

// ! START SERVER ------------
const startServer = async () => {
  const app = express()
  dotenv.config

  app.use(express.json())

  app.use(logger)
  app.use(router)
  app.use(errorHandler)  

  app.use((req,res) => {
    return res.status(404).send({ message: 'Required Endpoint not Found' })
  })

  await connectToDb()
  console.log('Database connected')

  app.listen(CONSTS.PORT, () => {
    console.log(`Server running on port ${CONSTS.PORT} `)
  })

}

startServer()