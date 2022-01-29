import mongoose from 'mongoose'

export interface IProduct {
  type?: string
  category?: string
  article?: string
  name: string
  description?: string
  tags?: string[]
  imgs?: string[]
  imgs_big?: string[]
  imgs_small?: string[]
  videos?: string[]
  buy_price: string
  delivery_price: string
  height: number
  length: number
  width: number
  weight: number
  brand?: string
  provider?: string
  address?: string
  mark?: string
  country?: string
  created?: Date
  user_creator_id?: string
  changed?: Date
  user_changed_id?: string
  barcode?: string
}

const ProductSchema = new mongoose.Schema<IProduct>({
  type: {
    type: String,
    maxLength: 100,
  },
  category: {
    type: String,
  },
  article: {
    type: String,
    maxLength: 100,
  },
  name: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    maxLength: 2000,
  },
  tags: {
    type: [String],
  },
  imgs: {
    type: [String],
  },
  imgs_big: {
    type: [String],
  },
  imgs_small: {
    type: [String],
  },
  videos: {
    type: [String],
  },
  buy_price: {
    type: String,
    required: true,
  },
  delivery_price: {
    type: String,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  brand: {
    type: String,
    maxLength: 100,
  },
  provider: {
    type: String,
    maxLength: 200,
  },
  address: {
    type: String,
    maxLength: 50,
  },
  mark: {
    type: String,
    maxLength: 100,
  },
  country: {
    type: String,
    maxLength: 50,
  },
  created: Date,
  user_creator_id: {
    type: String,
  },
  changed: Date,
  user_changed_id: {
    type: String,
  },
  barcode: {
    type: String,
  },
})

ProductSchema.index({ name: 'text' })

const ProductModel = mongoose.model('Product', ProductSchema)
export default ProductModel
