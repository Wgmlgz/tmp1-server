import express, { Request } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import auth_routes from './routes/auth'
import user_routes from './routes/user'
import remains_routes from './routes/remains'
import products_routes from './routes/products'
import categories_routes from './routes/category'
import warehouses_routes from './routes/warehouse'
import super_admin_routes from './routes/super_admin'
import products_in_routes from './routes/products_in'
import products_out_routes from './routes/products_out'
import products_move_routes from './routes/products_move'
import wildberries_routes from './routes/wildberries'
import cron from 'node-cron'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { CORS_ORIGIN, MONGO_CONNECTION_URL, PORT, NODE_ENV } from './config/env'
import fs from 'fs'
import { updateWildberriesStocks } from './controllers/wildberries'

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
app.use('/api/remains', remains_routes)
app.use('/api/products', products_routes)
app.use('/api/warehouses', warehouses_routes)
app.use('/api/products_in', products_in_routes)
app.use('/api/products_out', products_out_routes)
app.use('/api/products_move', products_move_routes)
app.use('/api/wildberries', wildberries_routes)

// if (NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')))

//   app.get('/static/*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', req.url))
//   })
//   app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
//   })
// }

mongoose
  .connect(MONGO_CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`server goes brrrrrr at ${PORT}`))
    cron.schedule(
      JSON.parse(fs.readFileSync('settings.json', 'utf8')).send_cron,
      async () => {
        console.log('updating stocks')

        const res = await updateWildberriesStocks()
        console.log('done', res)
      }
    )
  })
  .catch(err => console.log(err.message))
