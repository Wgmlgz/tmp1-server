import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import Product, { IProduct } from '../models/product'
import { IUser } from '../models/user'
import { resizeImg1024, resizeImg150 } from '../util/imgs'
import mongoose from 'mongoose'
// import { enshureAdmin } from './auth'

const UPLOAD_FILES_DIR = './upload/products'
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_FILES_DIR)
  },
  filename(req, file, cb) {
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname))
  },
})

export const upload = multer({ storage })

const parseReqToProduct = (req: Request) => {
  let {
    type,
    category,
    article,
    name,
    description,
    tags,
    videos,
    buy_price,
    delivery_price,
    height,
    length,
    width,
    weight,
    brand,
    count,
    address,
    provider,
  } = req.body

  let imgs: string[] | undefined = [],
    imgs_big: string[] | undefined = [],
    imgs_small: string[] | undefined = []

  // @ts-ignore
  req.files?.forEach(i => {
    const orig_path = i.path,
      small_path = `${uuidv4()}-${Date.now()}-small-${path.extname(
        i.originalname
      )}`,
      big_path = `${uuidv4()}-${Date.now()}-big-${path.extname(i.originalname)}`
    resizeImg1024(i.path, i.destination + '/' + big_path)
    resizeImg150(i.path, i.destination + '/' + small_path)

    imgs?.push(orig_path)
    imgs_big?.push(big_path)
    imgs_small?.push(small_path)
  })

  if (!req.files?.length) {
    imgs = undefined
    imgs_big = undefined
    imgs_small = undefined
  }
  const user: IUser & { id: string } = (req as any).user
  let product = {
    type,
    category,
    article: article || uuidv4(),
    name,
    description,
    tags: tags && JSON.parse(tags),
    imgs,
    imgs_big,
    imgs_small,
    videos: videos && JSON.parse(videos),
    buy_price,
    delivery_price,
    height,
    length,
    width,
    weight,
    brand,
    count,
    address,
    provider,
    user_creator_id: user.id,
    changed: new Date(),
    user_changed_id: user.id,
  }
  return product
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const doc = await Product.findOne({ name: req.body.name })
    if (doc) return res.status(400).send('Product Already Exists')

    const product = parseReqToProduct(req)

    const new_product = new Product(product)
    await new_product.save()
    res.send('Product created')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No product with id: ${id}`)
    const old_product = await Product.findById(id)
    // old_product.
    if (!old_product) return res.status(400).send(`Product doens't Exists`)

    const updated_product = parseReqToProduct(req)
    console.log(updated_product)

    Object.keys(updated_product).forEach(key =>
      // @ts-ignore
      updated_product[key] === undefined ? delete updated_product[key] : {}
    )
    console.log(updated_product)
    await Product.findByIdAndUpdate(id, updated_product, { new: true })
    res.send('Product updated')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
    res.status(200).json(products)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getImg = async (req: Request, res: Response) => {
  const { id } = req.params
  res.sendFile(`./upload/products/${id}`, { root: process.cwd() })
}
