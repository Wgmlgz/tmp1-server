import { Request, Response } from 'express'
import WBOrderModel from '../models/wb_orders'
import logger from '../util/logger'

export const getStats = async (req: Request, res: Response) => {
  try {
    const { start, end, product } = req.body

    const orders = await WBOrderModel.find({
      created: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    })

    const stats: any[] = []

    orders.forEach(order => {
      order.products.forEach(order_product => {
        order_product.id === product &&
          stats.push({
            product: order_product.id,
            amount: order_product.count,
            platform: 'wildberries',
            date: order.created,
          })
      })
    })

    res.status(200).send(stats)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
