import { Request, Response } from 'express'
import Warehouse, { IWarehouse } from '../models/warehouse'
import mongoose from 'mongoose'

export const createWarehouse = (req: Request, res: Response) => {
  try {
    let { name, descriptrion } = req.body
    if (!name) throw new Error('Expected name')
    Warehouse.findOne({ name }, async (err: Error, doc: IWarehouse) => {
      if (err) throw err
      if (doc) {
        return res.status(400).send('Warehouse already Exists')
      }

      const new_warehouse = new Warehouse({ name, descriptrion })
      await new_warehouse.save()
      res.send('Warehouse created')
    })
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const removeWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No warehouse with id: ${id}`)
    await Warehouse.findByIdAndRemove(id)
    res.status(200).send('Deleted')
  } catch (err: any) {
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
    res.status(400).send(err.message)
  }
}

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const categories = await Warehouse.find()
    const res_warehouses = categories.map(category => ({
      _id: category._id,
      name: category.name,
      descriptrion: category.descriptrion,
    }))
    res.status(200).json(res_warehouses)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
