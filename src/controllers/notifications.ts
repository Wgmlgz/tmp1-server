import { Request, Response } from 'express'
import NotificationModel from '../models/notification'
import logger from '../util/logger'
import mongoose from 'mongoose'
import ProductModel from '../models/product'
import WarehouseModel from '../models/warehouse'

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Promise.all(
      (
        await NotificationModel.find({})
      ).map(async notification => ({
        product: await ProductModel.findById(notification.product),
        warehouse: await WarehouseModel.findById(notification.warehouse),
        date: notification.date,
        id: notification.id,
      }))
    )
    res.status(200).json(notifications)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const removeNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No category with id: ${id}`)
    await NotificationModel.findByIdAndRemove(id)
    res.status(200).send('Deleted')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
