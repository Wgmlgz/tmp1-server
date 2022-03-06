import axios from 'axios'
import { trace } from 'console'
import { WILDBERRIES_URL } from '../config/env'
import ProductModel, { IProduct } from '../models/product'
import logger from '../util/logger'
import { readSettings } from './settings'

export const updatePrices = async () => {
  const products = await ProductModel.find({ update_price: true })

  const WILDBERRIES_API_KEY = (await readSettings()).api_key
  const wb_header = {
    headers: { Authorization: WILDBERRIES_API_KEY },
  }
  const table = new Map<number, any>(
    (
      await axios.get(`${WILDBERRIES_URL}/public/api/v1/info`, wb_header)
    ).data.map((item: any) => [item.nmId, item])
  )

  await Promise.allSettled(
    products.map(async product => {
      try {
        const nmId =
          product.marketplace_data &&
          Number(
            (product.marketplace_data as any as Map<string, string>).get(
              'Номенклатура Wildberries FBS'
            )
          )
        if (!nmId) return
        const wb_product = table.get(nmId)
        if (!wb_product) return
        const { price, discount } = wb_product

        const real_price = price * (1 - discount / 100)

        const db_price =
          Number(product.buy_price) + Number(product.delivery_price)

        let target_price = db_price

        if (db_price <= 49) target_price = 145
        else if (db_price <= 100) target_price = db_price * 3.0
        else if (db_price <= 200) target_price = db_price * 2.7
        else if (db_price <= 300) target_price = db_price * 2.5
        else if (db_price <= 350) target_price = db_price * 2.3
        else if (db_price <= 400) target_price = db_price * 2.2
        else target_price = db_price * 2.0

        target_price = Math.ceil(target_price)

        if (real_price >= target_price) return

        const target_discount = (1 - target_price / price) * 100
        if (target_discount < 0) {
          const new_price = target_price / (1 - discount / 100)
          logger.info(
            `updating price old: ${price}, new: ${new_price} nmId: ${nmId}`
          )
          const ans = await axios.post(
            `${WILDBERRIES_URL}/public/api/v1/prices`,
            [
              {
                price: Math.round(new_price),
                nmId: nmId,
              },
            ],
            wb_header
          )
        } else {
          const new_discount = target_discount
          logger.info(
            `updating discount old: ${discount}, new: ${new_discount} nmId: ${nmId}`
          )
          const ans = await axios.post(
            `${WILDBERRIES_URL}/public/api/v1/updateDiscounts`,
            [
              {
                discount: Math.round(new_discount),
                nm: nmId,
              },
            ],
            wb_header
          )
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          logger.log(e.response?.data)
        }
      }
    })
  )
}
