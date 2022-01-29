import { Request, Response } from 'express'
import Remain from '../models/remains'
import mongoose from 'mongoose'
import { IUser } from '../models/user'

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
