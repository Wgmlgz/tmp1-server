import { Request, Response } from 'express'
import Warehouse, { IWarehouse } from '../models/warehouse'
import mongoose from 'mongoose'
import WarehouseModel from '../models/warehouse'
import RemainModel from '../models/remains'
import ProductMoveModel, { IProductMove } from '../models/products_move'
import { MAIN_WAREHOUSE_ID } from '../config/env'
import { IUser } from '../models/user'
import { changeRemains } from './remains'
import logger from '../util/logger'

export const createWarehouse = (req: Request, res: Response) => {
  try {
    let { name, description } = req.body
    if (!name) throw new Error('Expected name')
    Warehouse.findOne({ name }, async (err: Error, doc: IWarehouse) => {
      if (err) throw err
      if (doc) {
        return res.status(400).send('Warehouse already Exists')
      }

      const new_warehouse = new Warehouse({ name, description })
      await new_warehouse.save()
      res.send('Warehouse created')
    })
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const removeWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No warehouse with id: ${id}`)
    const warehouse = await WarehouseModel.findById(id)
    if (warehouse?.undeletable) throw new Error('Этот склад невозможно удалить')

    const remains = await RemainModel.find({ warehouse: id })
    const req_user: IUser & { id: string } = (req as any).user

    const products_move_data: IProductMove = {
      warehouse_from: id,
      warehouse_to: MAIN_WAREHOUSE_ID,
      date: new Date(),
      user: req_user.id,
      products: [],
      comment: 'Автоматически после удаления склада',
    }
    remains.forEach(remain => {
      products_move_data.products.push({
        product: remain.product,
        quantity: remain.quantity,
      })
    })

    await changeRemains(
      products_move_data.products.map(product => ({
        warehouse: MAIN_WAREHOUSE_ID,
        product: product.product,
        quantity_add: product.quantity,
      }))
    )
    await Promise.all(
      remains.map(remain => RemainModel.findByIdAndDelete(remain.id))
    )

    const product_move = new ProductMoveModel(products_move_data)
    await product_move.save()
    await Warehouse.findByIdAndRemove(id)
    res.status(200).send('Deleted')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No warehouse with id: ${id}`)
    const old_warehouse = await Warehouse.findById(id)
    if (!old_warehouse) return res.status(400).send(`Product doens't Exists`)

    await Warehouse.findByIdAndUpdate(id, { name, description }, { new: true })
    res.send('Warehouse updated')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const categories = await Warehouse.find()
    const res_warehouses = categories.map(category => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      undeletable: category.undeletable,
    }))
    res.status(200).json(res_warehouses)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}
