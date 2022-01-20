import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import Product, { IProduct } from '../models/product'
import { IUser } from '../models/user'
import { resizeImg1024, resizeImg150 } from '../util/imgs'
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
    const imgs: string[] = [],
      imgs_big: string[] = [],
      imgs_small: string[] = []
    // @ts-ignore
    req.files?.forEach(i => {
      const orig_path = i.path,
        small_path = `${uuidv4()}-${Date.now()}-small-${path.extname(
          i.originalname
        )}`,
        big_path = `${uuidv4()}-${Date.now()}-big-${path.extname(
          i.originalname
        )}`
      resizeImg1024(i.path, i.destination + '/' + big_path)
      resizeImg150(i.path, i.destination + '/' + small_path)

      imgs.push(orig_path)
      imgs_big.push(big_path)
      imgs_small.push(small_path)
    })

    let product = {
      type,
      category,
      article: article || uuidv4(),
      name,
      description,
      tags: JSON.parse(tags),
      imgs,
      imgs_big,
      imgs_small,
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

    // if (req.file) {
    //   resizeImg(req.file.path)
    // }
    const new_category = new Product(product)
    await new_category.save()
    res.send('Product created')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    enshureAdmin(req)
    const products = await Product.find()
    // const res_categories = categories.map(category => {
    //   return {
    //     _id: category._id,
    //     name: category.name,
    //     descriptrion: category.descriptrion,
    //     img: category.img,
    //     tags: category.tags,
    //     parent: category.parent,
    //   }

    // })
    console.log(products);
    
    res.status(200).json(products)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
