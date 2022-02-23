import { Request, Response } from 'express'
import Category, { ICategory } from '../models/category'
import mongoose from 'mongoose'
import path from 'path'
import sharp from 'sharp'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { resizeImg100 } from '../util/imgs'
import Product from '../models/product'
import logger from '../util/logger'

sharp.cache(false)

const UPLOAD_FILES_DIR = './upload/categories'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_FILES_DIR)
  },
  filename(req, file, cb) {
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname))
  },
})

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

export const upload = multer({ storage, fileFilter })

export const createCategory = (req: Request, res: Response) => {
  try {
    let { name, description, img, tags, parent } = req.body
    tags = JSON.parse(tags)
    if (!name) throw new Error('Expected name')
    Category.findOne({ name }, async (err: Error, doc: ICategory) => {
      if (err) throw err
      if (doc) {
        return res.status(400).send('Category Already Exists')
      }

      if (req.file) {
        resizeImg100(req.file.path)
      }
      const new_category = new Category({
        name,
        description,
        img: req.file?.filename,
        tags,
        parent,
      })
      await new_category.save()
      res.send('Category Created')
    })
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const removeCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No category with id: ${id}`)
    const old = await Category.findById(id)
    const old_name = old?.name

    await Product.updateMany({}, [
      {
        $set: {
          category: {
            $cond: {
              if: { $eq: ['$category', old_name] },
              then: '',
              else: '$category',
            },
          },
        },
      },
    ])
    await Category.findByIdAndRemove(id)
    res.status(200).send('Deleted')
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find()
    const res_categories = categories.map(category => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      img: category.img,
      tags: category.tags,
      parent: category.parent,
    }))
    res.status(200).json(res_categories)
  } catch (err: any) {
    logger.error(err.message)
    res.status(400).send(err.message)
  }
}

export const getImg = async (req: Request, res: Response) => {
  const { id } = req.params
  res.sendFile(`./upload/categories/${id}`, { root: process.cwd() })
}
