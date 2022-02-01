import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import Product from '../models/product'
import { IUser } from '../models/user'
import { resizeImg1024, resizeImg150 } from '../util/imgs'
import mongoose from 'mongoose'
import RemainModel from '../models/remains'

const UPLOAD_FILES_DIR = './upload/products'
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_FILES_DIR)
  },
  filename(req, file, cb) {
    cb(null, `${uuidv4()}-${Date.now()}-orig.jpg`)
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
    address,
    provider,
    mark,
    country,
    barcode,
  } = req.body

  let imgs: string[] | undefined = [],
    imgs_big: string[] | undefined = [],
    imgs_small: string[] | undefined = []

  // @ts-ignore
  req.files?.forEach(i => {
    console.log('aboba', i);
    
    const orig_path = i.filename,
      small_path = `${uuidv4()}-${Date.now()}-small.jpg`,
      big_path = `${uuidv4()}-${Date.now()}-big.jpg`
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
    address,
    provider,
    mark,
    country,
    changed: new Date(),
    user_changed_id: user.id,
    barcode,
  }
  product.videos.forEach((video: string) => {
    if (
      !video.match(
        /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
      )
    ) {
      throw new Error('Invalid youtube link')
    }
  })
  return product
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const doc1 = await Product.findOne({ name: req.body.name })
    if (doc1) return res.status(400).send('Product already Exists')

    const doc2 = await Product.findOne({ article: req.body.article })
    if (doc2) return res.status(400).send('Product already Exists')

    const product = parseReqToProduct(req)

    const new_product = new Product(product)
    new_product.created = new Date()
    const user: IUser & { id: string } = (req as any).user
    new_product.user_creator_id = user.id
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
    if (!old_product) return res.status(400).send(`Product doens't Exists`)

    const updated_product = parseReqToProduct(req)
    console.log(updated_product)

    Object.keys(updated_product).forEach(key =>
      // @ts-ignore
      updated_product[key] === undefined ? delete updated_product[key] : {}
    )

    const doc1 = await Product.findOne({ article: updated_product.article })

    if (doc1 && doc1.id !== id)
      return res.status(400).send('Product with this article already exists')

    const doc2 = await Product.findOne({ name: updated_product.name })
    if (doc2 && doc2.id !== id)
      return res.status(400).send('Product with this name already Exists')

    await Product.findByIdAndUpdate(id, updated_product, { new: true })
    res.send('Product updated')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProduct = async (req: Request, res: Response) => {
  try {
    let { id } = req.params

    const product = await Product.findById(id)
    res.status(200).json(product)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const removeProducts = async (req: Request, res: Response) => {
  try {
    const { products } = req.body

    await Promise.all(
      products.map(async (product: string) => {
        await Product.findByIdAndRemove(product)
        await RemainModel.deleteMany({ product })
      })
    )
    res.status(200).json('Products deleated')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    let { pageNumber, nPerPage }: any = req.params

    pageNumber = parseInt(pageNumber)
    nPerPage = parseInt(nPerPage)

    const products = await Product.find()
      .skip(pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0)
      .limit(nPerPage)
    res.status(200).json(products)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
export const getCount = async (req: Request, res: Response) => {
  try {
    const products = await Product.count()
    res.status(200).json(products)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { str } = req.body

    let { pageNumber, nPerPage }: any = req.params

    pageNumber = parseInt(pageNumber)
    nPerPage = parseInt(nPerPage)

    if (str) {
      const products = await Product.find({
        $or: [
          { name: new RegExp(str, 'i') },
          { article: new RegExp(str, 'i') },
          { barcode: new RegExp(str, 'i') },
        ],
      })
        .skip(pageNumber > 0 ? (pageNumber - 1) * nPerPage : 0)
        .limit(nPerPage)

      res.status(200).json(products)
    } else {
      res.status(200).json([])
    }
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getImg = async (req: Request, res: Response) => {
  const { id } = req.params
  res.sendFile(`./upload/products/${id}`, { root: process.cwd() })
}
