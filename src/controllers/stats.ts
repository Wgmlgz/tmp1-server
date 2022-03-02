import { Request, Response } from 'express'
import WBOrderModel from '../models/wb_orders'
import logger from '../util/logger'

export const getStats = async (req: Request, res: Response) => {
  try {
    const { start, end, product } = req.body
    console.log(new Date(start))
    console.log(new Date(end))

    const orders = await WBOrderModel.find({
      created: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    })

    const stats: any[] = []

    orders.forEach(order => {
      order.products.forEach(product => {
        stats.push({
          product: product.id,
          amount: product.count,
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
