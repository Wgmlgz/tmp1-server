import express, { Request } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import auth_routes from './routes/auth'
import user_routes from './routes/user'
import super_admin_routes from './routes/super_admin'
import categories_routes from './routes/category'
import products_routes from './routes/products'

import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { CORS_ORIGIN, MONGO_CONNECTION_URL, PORT } from './config/env'
import path from 'path'

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
app.use('/api/user', user_routes)
app.use('/api/super_admin', super_admin_routes)
app.use('/api/categories', categories_routes)
app.use('/api/products', products_routes)

app.use(express.static(path.join(__dirname, '../build')))

app.get('/static/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', req.url))
})
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

mongoose
  .connect(MONGO_CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`server goes brrrrrr at ${PORT}`))
  )
  .catch(err => console.log(err.message))
