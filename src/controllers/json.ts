import { Request, Response } from 'express'
import CategoryModel from '../models/category'
import ProductModel from '../models/product'
import RemainModel from '../models/remains'
import SettingsModel from '../models/settings'
import logger from '../util/logger'
import { readSettings } from './settings'
import { getSetting } from './user'

export const getJsonCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find({})
    const json = await Promise.all(
      categories.map(async ({ id, description, parent, name }) => ({
        name,
        id,
        parent,
        description,
      }))
    )
    res.status(200).json(json)
    res.status(200).json(json)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getJsonStocks = async (req: Request, res: Response) => {
  try {
    const warehouse = await readSettings('warehouse_send')
    const stocks = await RemainModel.find({ warehouse })
    const json = await Promise.all(
      stocks.map(async ({ product, quantity }) => ({
        product_id: product,
        sku: (await ProductModel.findById(product))?.article || null,
        warehouse_id: warehouse,
        quantity,
      }))
    )
    res.status(200).json(json)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getJsonProducts = async (req: Request, res: Response) => {
  try {
    const { img_prefix } = req.body
    const sell_price = Number(await readSettings('sell_price')) || 1
    const opt_price = Number(await readSettings('opt_price')) || 1
    const products = await ProductModel.find({})
    const json = await Promise.all(
      products.map(
        async ({
          id,
          article,
          name,
          description,
          buy_price,
          delivery_price,
          imgs,
          category,
          brand,
          country,
        }) => ({
          id,
          sku: article,
          name,
          description,
          sebes_price: Number(buy_price) + Number(delivery_price),
          sell_price: (Number(buy_price) + Number(delivery_price)) * sell_price,
          opt_price: (Number(buy_price) + Number(delivery_price)) * opt_price,
          imgs: imgs?.map(img => `${img_prefix}/${img}`),
          category_name: category || null,
          category_id: category
            ? (
                await CategoryModel.findOne({ name: category })
              )?.id
            : null,
          brand,
          country,
        })
      )
    )
    res.status(200).json(json)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
