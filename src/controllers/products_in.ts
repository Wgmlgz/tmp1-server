import { Request, Response } from 'express'
import ProductIn, { IProductIn } from '../models/products_in'
import mongoose from 'mongoose'
import { IUser } from '../models/user'

export const createProductIn = async (req: Request, res: Response) => {
  try {
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse, date, comment, products } = req.body
    const user = req_user.id

    const new_product_in = new ProductIn({
      warehouse,
      date,
      user,
      comment,
      products,
    })
    await new_product_in.save()
    res.send('ProductIn created')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const removeProductIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No ProductIn with id: ${id}`)
    await ProductIn.findByIdAndRemove(id)
    res.status(200).send('Deleted')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const updateProductIn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse, date, comment, products } = req.body
    const user = req_user.id

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No product_in with id: ${id}`)
    const old_product_in = await ProductIn.findById(id)
    if (!old_product_in) return res.status(400).send(`ProductIn doens't Exists`)

    await ProductIn.findByIdAndUpdate(
      id,
      { warehouse, date, comment, products, user },
      { new: true }
    )
    res.send('ProductIn updated')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProductsIn = async (req: Request, res: Response) => {
  try {
    const categories = await ProductIn.find()
    const res_products_in = categories.map(product_in => ({
      _id: product_in._id,
      warehouse: product_in.warehouse,
      date: product_in.date,
      user: product_in.user,
      comment: product_in.comment,
      products: product_in.products,
    }))
    res.status(200).json(res_products_in)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
