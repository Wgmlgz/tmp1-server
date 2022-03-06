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
import notifications_routes from './routes/notifications'
import stats_routes from './routes/stats'
import cron from 'node-cron'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { CORS_ORIGIN, MONGO_CONNECTION_URL, PORT, NODE_ENV } from './config/env'
import fs from 'fs'
import {
  refreshOrders,
  runUpdateWildberriesStocks,
  updateWildberriesStocks,
} from './controllers/wildberries'
import logger from './util/logger'
import { readSettings } from './controllers/settings'
import { updatePrices } from './controllers/update_prices'

let dir = './upload/categories'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
dir = './upload/products'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

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
app.use('/api/stats', stats_routes)
app.use('/api/notifications', notifications_routes)

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
  .then(async () => {
    app.listen(PORT, () => {
      logger.info(`Mongo connection - OK`)
      logger.info(`server goes brrrrrr at ${PORT}`)
      console.log(`server goes brrrrrr at ${PORT}`)
    })
    // try {
    //   const res = await updatePrices()
    //   logger.info(`updating prices done:`, res)
    // } catch (err) {
    //   logger.error(`updating prices error:`, err)
    // }
    cron.schedule((await readSettings()).send_cron, async () => {
      if ((await readSettings()).send_cron_enabled) {
        try {
          logger.info(`updating stocks`)
          const res = await updateWildberriesStocks()
          logger.info(`updating stocks done:`, res)
        } catch (err) {
          logger.error(`updating stocks error:`, err)
        }
      }
    })
    cron.schedule((await readSettings()).update_orders_cron, async () => {
      if ((await readSettings()).update_orders_cron_enabled) {
        try {
          const res = await refreshOrders()
          logger.info(`updating orders done:`, res)
        } catch (err) {
          logger.error(`updating orders error:`, err)
        }
      }
    })
    cron.schedule((await readSettings()).update_prices_cron, async () => {
      if ((await readSettings()).update_prices_cron_enabled) {
        try {
          const res = await updatePrices()
          logger.info(`updating prices done:`, res)
        } catch (err) {
          logger.error(`updating prices error:`, err)
        }
      }
    })
  })
  .catch(err => {
    logger.error(`Mongo connection - problem`, err.message)
    console.log(err.message)
  })
