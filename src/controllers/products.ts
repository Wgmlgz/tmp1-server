import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import Product, { IProduct } from '../models/product'
import { IUser } from '../models/user'
import { resizeImg } from '../util/imgs'
import { enshureAdmin } from './auth'

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

export const createProduct = async (req: Request, res: Response) => {
  try {
    enshureAdmin(req)
    const user: IUser & { id: string } = (req as any).user
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
    console.log(user)

    console.log(req.files)

    // @ts-ignore
    const imgs = req.files?.map(i => i.filename)
    // const imgs = req.files
    // imgs?.forEach(file => {

    // })
    let product = {
      type,
      category,
      article: article || uuidv4(),
      name,
      description,
      tags: JSON.parse(tags),
      imgs,
      videos: JSON.parse(videos),
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

    console.log(product)

    Product.findOne()
    const doc = await Product.findOne({ name })
    if (doc) {
      return res.status(400).send('Product Already Exists')
    }

    if (req.file) {
      resizeImg(req.file.path)
    }
    const new_category = new Product(product)
    await new_category.save()
    res.send('Product created')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
