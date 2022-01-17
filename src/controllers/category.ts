import { Request, Response } from 'express'
import Category, { ICategory } from '../models/category'
import mongoose from 'mongoose'
import { enshureAdmin } from './auth'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

sharp.cache(false)

async function resizeFile(path: string) {
  let buffer = await sharp(path).resize(100, 100).toBuffer()
  return sharp(buffer).toFile(path)
}

export const createCategory = (req: Request, res: Response) => {
  try {
    enshureAdmin(req)
    let { name, descriptrion, img, tags, parent } = req.body
    tags = JSON.parse(tags)
    if (!name) throw new Error('Expected name')
    Category.findOne({ name }, async (err: Error, doc: ICategory) => {
      if (err) throw err
      if (doc) {
        return res.status(400).send('Category Already Exists')
      }

      if (req.file) {
        resizeFile(req.file.path)
      }
      const new_category = new Category({
        name,
        descriptrion,
        img: req.file?.filename,
        tags,
        parent,
      })
      await new_category.save()
      res.send('Category Created')
    })
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}

export const removeCategory = async (req: Request, res: Response) => {
  try {
    enshureAdmin(req)
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No category with id: ${id}`)
    await Category.findByIdAndRemove(id)
      res.status(200).send('Deleted')
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
export const getCategories = async (req: Request, res: Response) => {
  try {
    enshureAdmin(req)
    const categories = await Category.find()
    const res_categories = categories.map(category => {
      return {
        _id: category._id,
        name: category.name,
        descriptrion: category.descriptrion,
        img: category.img,
        tags: category.tags,
        parent: category.parent,
      }
    })
    res.status(200).json(res_categories)
  } catch (err: any) {
    res.status(400).send(err.message)
  }
}
