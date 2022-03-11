import { Request, Response } from 'express'
import { Mongoose } from 'mongoose'
import CategoryModel from '../models/category'
import ExcelImportModel from '../models/excel_import'
import ProductModel from '../models/product'
import ProductInModel from '../models/products_in'
import ProductOutModel from '../models/products_out'
import RemainModel from '../models/remains'
import SettingsModel from '../models/settings'
import UserModel from '../models/user'
import WarehouseModel from '../models/warehouse'
import WBOrderModel from '../models/wb_orders'
import logger from '../util/logger'

const collections = [
  RemainModel,
  UserModel,
  ProductModel,
  WBOrderModel,
  CategoryModel,
  SettingsModel,
  ProductInModel,
  WarehouseModel,
  ProductOutModel,
  ExcelImportModel,
]

export const getBackup = async (req: Request, res: Response) => {
  try {
    const { start, end, product } = req.body
    let backup: any = {}

    await Promise.allSettled(
      collections.map(async x => {
        // @ts-ignore
        backup[x.modelName] = await x.find({})
      })
    )
    res.status(200).send(backup)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { backup } = req.body

    res.status(200).send('Восстановленно')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
