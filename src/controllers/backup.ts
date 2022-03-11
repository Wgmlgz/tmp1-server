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
    /** validate shape */
    try {
      collections.map(x => {
        if (!Array.isArray(backup[x.modelName])) throw new Error('err')
      })
    } catch (err) {
      const msg = 'Неверный формат файла'
      throw new Error(msg)
    }

    /** remove */
    await Promise.allSettled(
      collections.map(async x => {
        await x.deleteMany(() => {})
      })
    )
    /** restore */
    collections.map(async x => {
      await x.insertMany(backup[x.modelName])
      logger.error(`Restoring ${x.modelName} done`)
    })

    res.status(200).send('Restoring started')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
