import { Request, Response } from 'express'
import NotificationModel from '../models/notification'
import Remain from '../models/remains'
import logger from '../util/logger'

export const checkRemain = async (
  warehouse: string,
  product: string,
  quantity_add: number
) => {
  const remain = await Remain.findOne({ warehouse, product })
  const old = remain ? remain.quantity : 0

  if (old + quantity_add < 0) {
    throw new Error(`Not enough products`)
  }
}

export const checkRemains = async (
  data: {
    warehouse: string
    product: string
    quantity_add: number
  }[]
) => {
  await Promise.all(
    data.map(
      async item =>
        await checkRemain(item.warehouse, item.product, item.quantity_add)
    )
  )
}

export const changeRemain = async (
  warehouse: string,
  product: string,
  quantity_add: number
) => {
  const remain = await Remain.findOne({ warehouse, product })
  if (!remain) {
    Remain.create({ warehouse, product, quantity: quantity_add })
    return
  }
  if (remain.quantity + quantity_add <= 999999999) {
    const notification = new NotificationModel({
      date: new Date(),
      product,
      warehouse,
    })
    await notification.save()
  }
  await Remain.findByIdAndUpdate(
    remain.id,
    { warehouse, product, quantity: remain.quantity + quantity_add },
    { new: true }
  )
}

export const changeRemains = async (
  data: {
    warehouse: string
    product: string
    quantity_add: number
  }[]
) => {
  await Promise.all(
    data.map(
      async item =>
        await changeRemain(item.warehouse, item.product, item.quantity_add)
    )
  )
}

export const getRemains = async (req: Request, res: Response) => {
  try {
    const remains = await Remain.find()
    const res_remains = remains.map(remain => ({
      _id: remain._id,
      quantity: remain.quantity,
      warehouse: remain.warehouse,
      product: remain.product,
    }))
    res.status(200).json(res_remains)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
