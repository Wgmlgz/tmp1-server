import express from 'express'
import {
  createCategory,
  removeCategory,
  getCategories,
} from '../controllers/categories'
import { authenticateToken } from '../controllers/auth'
import { createProduct, upload } from '../controllers/products'


const router = express.Router()

router.post('/', [upload.array('imgs', 12), authenticateToken], createProduct)

export default router
