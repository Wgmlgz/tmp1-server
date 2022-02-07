import { Request, Response } from 'express'
import Warehouse, { IWarehouse } from '../models/warehouse'
import mongoose from 'mongoose'
import { WILDBERRIES_API_KEY, WILDBERRIES_URL } from '../config/env'
import axios from 'axios'
import ProductModel, { IProduct } from '../models/product'

interface IWilbberriesProduct {
  barcode: string
  article: string
  name: string
  price: string
  sell_price: string
}

export const getWildberriesProducts = async (req: Request, res: Response) => {
  try {
    const table = (
      await axios.get(`${WILDBERRIES_URL}/public/api/v1/info`, {
        headers: { Authorization: WILDBERRIES_API_KEY },
      })
    ).data

    const db_products = new Map<string, IProduct>(
      (
        await ProductModel.find({
          'marketplace_data.Номенклатура Wildberries FBS': {
            $in: table.map((item: any) => item.nmId.toString()),
          },
        })
      ).map((product: any) => [
        product.marketplace_data.get('Номенклатура Wildberries FBS'),
        product,
      ])
    )

    table.forEach((item: any) => {
      const db_product = db_products.get(item.nmId.toString())
      if (!db_product) return

      item.name = db_product.name
      db_product.marketplace_data &&
        (item.barcode = (db_product.marketplace_data as any).get(
          'Штрихкод Wildberries FBS'
        ))
      db_product.imgs_small && (item.img = db_product.imgs_small[0])
      item.buy_price = db_product.buy_price
      item.delivery_price = db_product.delivery_price
    })

    res.status(200).json(table)
  } catch (err: any) {
    res.status(200).json(err.message)
  }
}

export const getWildberriesOrders = async (req: Request, res: Response) => {
  try {
    const orders = (
      await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
        headers: { Authorization: WILDBERRIES_API_KEY },
        params: {
          status: req.query.status,
          date_start: req.query.date_start,
          take: req.query.take,
          skip: Number(req.query.skip),
        },
      })
    ).data
    res.status(200).send(orders)
  } catch (err: any) {
    console.log(err)
    
    res.status(400).json(err.message)
  }
}

export const updateWildberriesSettings = async (
  req: Request,
  res: Response
) => {
  try {
    res.status(200).send('settings updated')
  } catch (err: any) {
    res.status(200).json(err.message)
  }
}
