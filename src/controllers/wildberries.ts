import { Request, Response } from 'express'
import Warehouse, { IWarehouse } from '../models/warehouse'
import mongoose from 'mongoose'
import { WB_WAREHOUSE_ID, WILDBERRIES_URL } from '../config/env'
import axios from 'axios'
import ProductModel, { IProduct } from '../models/product'
import RemainModel from '../models/remains'
import fs from 'fs'
import moment from 'moment'
import WBOrderModel from '../models/wb_orders'
import { changeRemain, changeRemains } from './remains'

interface IWilbberriesProduct {
  barcode: string
  article: string
  name: string
  price: string
  sell_price: string
}

export const getWildberriesProducts = async (req: Request, res: Response) => {
  try {
    const WILDBERRIES_API_KEY = JSON.parse(
      fs.readFileSync('settings.json', 'utf8')
    ).api_key
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
    const WILDBERRIES_API_KEY = JSON.parse(
      fs.readFileSync('settings.json', 'utf8')
    ).api_key

    const wb_header = { headers: { Authorization: WILDBERRIES_API_KEY } }
    const status = req.query.status

    let orders: any = { orders: [], total: 0 }

    if (status === 'new') {
      orders = (
        await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
          ...wb_header,
          params: {
            status: 0,
            date_start: moment().subtract(96, 'hours').toISOString(),
            take: Number(req.query.take),
            skip: Number(req.query.skip),
          },
        })
      ).data
      orders.orders = orders.orders.filter(
        (order: { userStatus: number }) => order.userStatus === 4
      )
    } else if (status === 'on_assembly') {
      orders = (
        await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
          ...wb_header,
          params: {
            status: 1,
            date_start: moment().subtract(96, 'hours').toISOString(),
            take: Number(req.query.take),
            skip: Number(req.query.skip),
          },
        })
      ).data
    } else if (status === 'active') {
      orders = await Promise.all(
        (
          await Promise.all(
            (
              await axios.get(`${WILDBERRIES_URL}/api/v2/supplies`, {
                ...wb_header,
                params: {
                  status: 'ACTIVE',
                },
              })
            ).data.supplies
              .map((supply: { supplyId: string }) => supply.supplyId)
              .map(async (supply: string) =>
                (
                  await axios.get(
                    `${WILDBERRIES_URL}/api/v2/supplies/${supply}/orders`,
                    wb_header
                  )
                ).data.orders.map((order: any) => ({ ...order, supply }))
              )
          )
        )
          .flat()
          .map(order => [parseInt(order.orderId), order.supply])
          .map(async ([orderId, supply]) => ({
            ...(
              await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
                ...wb_header,
                params: {
                  id: orderId,
                  skip: 0,
                  take: 1,
                  date_start: '2021-01-11T17:52:51+00:00',
                },
              })
            ).data.orders[0],
            supply,
          }))
      )
      orders = { orders, total: orders.length }
    } else if (status === 'on_delivery') {
      orders = await Promise.all(
        (
          await Promise.all(
            (
              await axios.get(`${WILDBERRIES_URL}/api/v2/supplies`, {
                ...wb_header,
                params: {
                  status: 'ON_DELIVERY',
                },
              })
            ).data.supplies
              .map((supply: { supplyId: string }) => supply.supplyId)
              .map(async (supply: string) =>
                (
                  await axios.get(
                    `${WILDBERRIES_URL}/api/v2/supplies/${supply}/orders`,
                    wb_header
                  )
                ).data.orders.map((order: any) => ({ ...order, supply }))
              )
          )
        )
          .flat()
          .map(order => [parseInt(order.orderId), order.supply])
          .map(async ([orderId, supply]) => ({
            ...(
              await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
                ...wb_header,
                params: {
                  id: orderId,
                  skip: 0,
                  take: 1,
                  date_start: '2021-01-11T17:52:51+00:00',
                },
              })
            ).data.orders[0],
            supply,
          }))
      )
      orders = { orders, total: orders.length }
    } else if (status === 'all') {
      orders = (
        await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
          ...wb_header,
          params: {
            date_start: '2021-01-11T17:52:51+00:00',
            take: Number(req.query.take),
            skip: Number(req.query.skip),
          },
        })
      ).data
    }

    const warehouses = new Map<number, string>(
      (
        await axios.get(`${WILDBERRIES_URL}/api/v2/warehouses`, wb_header)
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
    console.log(err)

    res.status(400).json(err.message)
  }
}

export const updateWildberriesSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const { sender_warehouse, send_cron, update_orders_cron } = req.body
    const old = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
    if (sender_warehouse) old.sender_warehouse = sender_warehouse
    if (send_cron) old.send_cron = send_cron
    if (update_orders_cron) old.update_orders_cron = update_orders_cron
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
  const WILDBERRIES_API_KEY = JSON.parse(
    fs.readFileSync('settings.json', 'utf8')
  ).api_key
  const wb_header = { headers: { Authorization: WILDBERRIES_API_KEY } }

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
    wb_header
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

export const checkWildberriesConnection = async (
  req: Request,
  res: Response
) => {
  try {
    const WILDBERRIES_API_KEY = JSON.parse(
      fs.readFileSync('settings.json', 'utf8')
    ).api_key

    await axios.get(`${WILDBERRIES_URL}/api/v2/warehouses`, {
      headers: { Authorization: WILDBERRIES_API_KEY },
    })

    res.status(200).send('Соединено')
  } catch (err: any) {
    res.status(400).json(err.message)
  }
}

export const refreshOrders = async () => {
  const setting = JSON.parse(fs.readFileSync('settings.json', 'utf8'))
  const WILDBERRIES_API_KEY = setting.api_key
  const wb_header = { headers: { Authorization: WILDBERRIES_API_KEY } }

  const total = (
    await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
      ...wb_header,
      params: {
        date_start: '2000-01-11T17:52:51+00:00',
        date_end: new Date().toISOString(),
        take: 1,
        skip: 0,
      },
    })
  ).data.total
  console.log('total:', total)

  const take = 1000
  let orders: any[] = []
  for (let i = 0; i < total; i += take) {
    orders.push(
      (
        await axios.get(`${WILDBERRIES_URL}/api/v2/orders`, {
          ...wb_header,
          params: {
            date_start: '2000-01-11T17:52:51+00:00',
            take: take,
            skip: i,
          },
        })
      ).data.orders
    )
  }
  orders = orders.flat()

  const old_orders = await WBOrderModel.find({})
  const old_orders_ids = new Set<string>(
    old_orders.map(order => order.wb_order_id)
  )
  let old_count = old_orders.length

  orders = orders.filter(order => !old_orders_ids.has(order.orderId))

  const orders2save = await Promise.all(
    orders.map(async order => {
      const barcodes = order.barcodes.reduce(
        (acc: { [x: string]: number }, curr: string) => {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc
        },
        {}
      )
      const db_products = new Map<string, IProduct & { id: string }>(
        (
          await ProductModel.find({
            'marketplace_data.Штрихкод Wildberries FBS': {
              $in: order.barcodes,
            },
          })
        ).map((product: any) => [
          product.marketplace_data.get('Штрихкод Wildberries FBS'),
          product,
        ])
      )

      return {
        order_id: ++old_count,
        wb_order_id: order.orderId,
        created: new Date(),
        products: Object.entries(barcodes)
          .map(([barcode, count]) => ({
            id: db_products.get(barcode)?.id ?? '',
            count: Number(count),
          }))
          .filter(x => x.id),
        cost: Object.entries(barcodes)
          .map(
            ([barcode, count]: any) =>
              parseInt(db_products.get(barcode)?.buy_price ?? '0') * count
          )
          .reduce((acc, cur) => acc * cur, 1),
        status: 0,
        warehouse_id: setting.sender_warehouse,
        wb_order: order,
      }
    })
  )
  await Promise.allSettled(
    orders2save.map(async order => {
      try {
        const new_order = new WBOrderModel(order)
        await new_order.save()
        await changeRemains(
          order.products.map(({ id, count }) => ({
            warehouse: order.warehouse_id,
            product: id,
            quantity_add: -count,
          }))
        )
      } catch (err: any) {
        console.log(err.message)
      }
    })
  )

  return Promise.resolve(orders2save)
}

export const runRefreshOrdeers = async (req: Request, res: Response) => {
  try {
    const ans = await refreshOrders()

    res.status(200).json(ans)
  } catch (err: any) {
    console.log(err)

    res.status(200).json(err.message)
  }
}
