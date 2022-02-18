import { Request, Response } from 'express'
import ProductIn from '../models/products_in'
import mongoose from 'mongoose'
import { IUser } from '../models/user'
import { changeRemains, checkRemains } from './remains'
import Product from '../models/product'

export const createProductIn = async (req: Request, res: Response) => {
  try {
    const req_user: IUser & { id: string } = (req as any).user

    let { warehouse, date, comment, products } = req.body
    const user = req_user.id

    console.log(req_user)
    
    // await checkRemains(
    //   products.map(
    //     (product: { product: string; name: string; quantity: number }) => ({
    //       warehouse,
    //       product: product.product,
    //       quantity_add: product.quantity,
    //     })
    //   )
    // )
    const new_product_in = new ProductIn({
      warehouse,
      date,
      user,
      comment,
      products,
    })
    await new_product_in.save()
    await changeRemains(
      products.map(
        (product: { product: string; name: string; quantity: number }) => ({
          warehouse,
          product: product.product,
          quantity_add: product.quantity,
        })
      )
    )

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
    const product_in = await ProductIn.findById(id)
    if (!product_in) throw new Error('ProductIn not found')
    await checkRemains(
      product_in.products.map(product => ({
        warehouse: product_in.warehouse,
        product: product.product,
        quantity_add: -product.quantity,
      }))
    )
    await changeRemains(
      product_in.products.map(product => ({
        warehouse: product_in.warehouse,
        product: product.product,
        quantity_add: -product.quantity,
      }))
    )
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

    await checkRemains(
      old_product_in.products.map(product => ({
        warehouse: old_product_in.warehouse,
        product: product.product,
        quantity_add: -product.quantity,
      }))
    )
    await checkRemains(
      products.map(
        (product: { product: string; name: string; quantity: number }) => ({
          warehouse,
          product: product.product,
          quantity_add: product.quantity,
        })
      )
    )

    await changeRemains(
      old_product_in.products.map(product => ({
        warehouse: old_product_in.warehouse,
        product: product.product,
        quantity_add: -product.quantity,
      }))
    )

    await changeRemains(
      products.map(
        (product: { product: string; name: string; quantity: number }) => ({
          warehouse,
          product: product.product,
          quantity_add: product.quantity,
        })
      )
    )
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
    const res_products_in = await Promise.all(
      categories.map(async product_in => ({
        _id: product_in._id,
        warehouse: product_in.warehouse,
        date: product_in.date,
        user: product_in.user,
        comment: product_in.comment,
        products: await Promise.all(
          product_in.products.map(async product => ({
            product: product.product,
            quantity: product.quantity,
            name: (await Product.findById(product.product))?.name,
          }))
        ),
      }))
    )
    res.status(200).json(res_products_in)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
