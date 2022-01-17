import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import auth_routes from './routes/auth'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { CORS_ORIGIN, MONGO_CONNECTION_URL, PORT } from './config/env'

const app = express()
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)

app.use('/api/auth', auth_routes)

mongoose
  .connect(MONGO_CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`server goes brrrrrr at ${PORT}`))
  )
  .catch(err => console.log(err.message))