import { Request, Response } from 'express'
import Warehouse, { IWarehouse } from '../models/warehouse'
import mongoose from 'mongoose'
import {
  WB_WAREHOUSE_ID,
  WILDBERRIES_API_KEY,
  WILDBERRIES_URL,
} from '../config/env'
import axios from 'axios'
import ProductModel, { IProduct } from '../models/product'
import RemainModel from '../models/remains'
import fs from 'fs'

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
      item.article = db_product.article
    })

    res.status(200).json(table)
  } catch (err: any) {
    res.status(400).json(err.message)
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
          take: Number(req.query.take),
          skip: Number(req.query.skip),
        },
      })
    ).data
    const warehouses = new Map<number, string>(
      (
        await axios.get(`${WILDBERRIES_URL}/api/v2/warehouses`, {
          headers: { Authorization: WILDBERRIES_API_KEY },
        })
      ).data.map(({ id, name }: { id: number; name: string }) => [id, name])
    )
    const db_products = new Map<string, IProduct>(
      (
        await ProductModel.find({
          'marketplace_data.Штрихкод Wildberries FBS': {
            $in: orders.orders.map((item: any) => item.barcode),
          },
        })
      ).map((product: any) => [
        product.marketplace_data.get('Штрихкод Wildberries FBS'),
        product,
      ])
    )
    orders.orders.forEach((item: any) => {
      item.warehouse = warehouses.get(item.storeId)
      const db_product = db_products.get(item.barcode)
      if (!db_product) return

      item.name = db_product.name
      db_product.imgs_small && (item.img = db_product.imgs_small[0])
      item.brand = db_product.brand
      item.article = db_product.article
    })

    res.status(200).send(orders)
  } catch (err: any) {
    res.status(400).json(err.message)
  }
}

export const updateWildberriesSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const { sender_warehouse, send_cron } = req.body
    const old = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
    if (sender_warehouse) old.sender_warehouse = sender_warehouse
    if (send_cron) old.send_cron = send_cron
    fs.writeFileSync('settings.json', JSON.stringify(old, null, 2))
    res.status(200).send('settings updated')
  } catch (err: any) {
    res.status(400).json(err.message)
  }
}
export const getWildberriesSettings = async (req: Request, res: Response) => {
  try {
    const old = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
    res.status(200).json(old)
  } catch (err: any) {
    res.status(400).json(err.message)
  }
}

export const updateWildberriesStocks = async () => {
  const warehouse = JSON.parse(
    fs.readFileSync('settings.json', 'utf8')
  ).sender_warehouse
  const wb_warehouse = WB_WAREHOUSE_ID
  const remains = await RemainModel.find({ warehouse })

  const sended_stocs = (
    await Promise.all(
      remains.map(async remain => ({
        barcode: (
          (
            await ProductModel.findById(remain.product)
          )?.marketplace_data as any
        )?.get('Штрихкод Wildberries FBS'),
        stock: remain.quantity,
        warehouseId: wb_warehouse,
      }))
    )
  ).filter(x => x.barcode)

  const res = await axios.post(
    `${WILDBERRIES_URL}/api/v2/stocks`,
    sended_stocs,
    {
      headers: { Authorization: WILDBERRIES_API_KEY },
    }
  )
  return Promise.resolve(res.data)
}
export const runUpdateWildberriesStocks = async (
  req: Request,
  res: Response
) => {
  try {
    const ans = await updateWildberriesStocks()
    res.status(200).json(ans)
  } catch (err: any) {
    console.log(err)

    res.status(200).json(err.message)
  }
}
