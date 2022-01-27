import { Request, Response } from 'express'
import ProductMove from '../models/products_move'
import mongoose from 'mongoose'
import { IUser } from '../models/user'

export const createProductMove = async (req: Request, res: Response) => {
  try {
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse_to, warehouse_from, date, comment, products } = req.body
    const user = req_user.id

    const new_product_move = new ProductMove({
      warehouse_to,
      warehouse_from,
      date,
      user,
      comment,
      products,
    })
    await new_product_move.save()
    res.send('ProductMove created')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const removeProductMove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No ProductMove with id: ${id}`)
    await ProductMove.findByIdAndRemove(id)
    res.status(200).send('Deleted')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const updateProductMove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse_to, warehouse_from, date, comment, products } = req.body
    const user = req_user.id

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No product_move with id: ${id}`)
    const old_product_move = await ProductMove.findById(id)
    if (!old_product_move)
      return res.status(400).send(`ProductMove doens't Exists`)

    await ProductMove.findByIdAndUpdate(
      id,
      { warehouse_to, warehouse_from, date, comment, products, user },
      { new: true }
    )
    res.send('ProductMove updated')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProductsMove = async (req: Request, res: Response) => {
  try {
    const categories = await ProductMove.find()
    const res_products_move = categories.map(product_move => ({
      _id: product_move._id,
      warehouse_to: product_move.warehouse_to,
      warehouse_from: product_move.warehouse_from,
      date: product_move.date,
      user: product_move.user,
      comment: product_move.comment,
      products: product_move.products,
    }))
    res.status(200).json(res_products_move)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
