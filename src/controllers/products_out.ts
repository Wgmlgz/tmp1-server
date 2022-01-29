import { Request, Response } from 'express'
import ProductOut from '../models/products_out'
import mongoose from 'mongoose'
import { IUser } from '../models/user'
import { changeRemains } from './remains'

export const createProductOut = async (req: Request, res: Response) => {
  try {
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse, date, comment, products } = req.body
    const user = req_user.id

    const new_product_out = new ProductOut({
      warehouse,
      date,
      user,
      comment,
      products,
    })
    await new_product_out.save()
    await changeRemains(
      products.map(
        (product: { product: string; name: string; quantity: number }) => ({
          warehouse,
          product: product.product,
          quantity_add: -product.quantity,
        })
      )
    )
    res.send('ProductOut created')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const removeProductOut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No ProductOut with id: ${id}`)
    const product_out = await ProductOut.findById(id)
    if (!product_out) throw new Error('Product not found')
    await ProductOut.findByIdAndRemove(id)
    await changeRemains(
      product_out.products.map(product => ({
        warehouse: product_out.warehouse,
        product: product.product,
        quantity_add: product.quantity,
      }))
    )
    res.status(200).send('Deleted')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const updateProductOut = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse, date, comment, products } = req.body
    const user = req_user.id

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No product_out with id: ${id}`)
    const old_product_out = await ProductOut.findById(id)
    if (!old_product_out)
      return res.status(400).send(`ProductOut doens't Exists`)

    await changeRemains(
      old_product_out.products.map(product => ({
        warehouse: old_product_out.warehouse,
        product: product.product,
        quantity_add: product.quantity,
      }))
    )

    await ProductOut.findByIdAndUpdate(
      id,
      { warehouse, date, comment, products, user },
      { new: true }
    )
    await changeRemains(
      products.map(
        (product: { product: string; name: string; quantity: number }) => ({
          warehouse,
          product: product.product,
          quantity_add: -product.quantity,
        })
      )
    )
    res.send('ProductOut updated')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProductsOut = async (req: Request, res: Response) => {
  try {
    const categories = await ProductOut.find()
    const res_products_out = categories.map(product_out => ({
      _id: product_out._id,
      warehouse: product_out.warehouse,
      date: product_out.date,
      user: product_out.user,
      comment: product_out.comment,
      products: product_out.products,
    }))
    res.status(200).json(res_products_out)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
