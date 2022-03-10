import { readSettings } from '../controllers/settings'
import { updatePrices } from '../controllers/update_prices'
import {
  refreshOrders,
  updateWildberriesStocks,
} from '../controllers/wildberries'
import logger from './logger'

export const updateStocksTask = async () => {
  if (await readSettings('update_stocks_enabled')) {
    try {
      logger.info(`updating stocks`)
      const res = await updateWildberriesStocks()
      logger.info(`updating stocks done:`, res)
    } catch (err) {
      logger.error(`updating stocks error:`, err)
    }
  }

  setTimeout(
    updateStocksTask,
    Number(await readSettings('update_stocks')) * 1000 || 60 * 10 * 1000
  )
}

export const updateOrdersTask = async () => {
  if (await readSettings('update_orders_enabled')) {
    try {
      const res = await refreshOrders()
      logger.info(`updating orders done:`, res)
    } catch (err) {
      logger.error(`updating orders error:`, err)
    }
  }
  setTimeout(
    updateOrdersTask,
    Number(await readSettings('update_orders')) * 1000 || 60 * 10 * 1000
  )
}
export const updatePricesTask = async () => {
  if (await readSettings('update_prices_enabled')) {
    try {
      const res = await updatePrices()
      logger.info(`updating prices done:`, res)
    } catch (err) {
      logger.error(`updating prices error:`, err)
    }
  }

  setTimeout(
    updatePricesTask,
    Number(await readSettings('update_prices')) * 1000 || 60 * 10 * 1000
  )
}