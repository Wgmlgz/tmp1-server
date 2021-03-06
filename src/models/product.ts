import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

export interface IProduct {
  type?: string
  category?: string
  article?: string
  name: string
  description?: string
  color?: string
  tags?: string[]
  imgs?: string[]
  imgs_big?: string[]
  imgs_small?: string[]
  videos?: string[]
  buy_price: string
  delivery_price: string
  update_price: boolean
  height: number
  length: number
  width: number
  weight: number
  brand?: string
  provider?: string
  mark?: string
  country?: string
  created?: Date
  user_creator_id?: string
  changed?: Date
  user_changed_id?: string
  barcode?: string
  marketplace_data?: {
    [id: string]: string
  }
  addresses?: {
    [id: string]: string
  }
}

export interface IProductExcel extends IProduct {
  upload_imgs: string[]
  excel_row: number
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
    unique: true,
    dropDups: true,
    required: [true, 'Введите имя'],
    maxLength: 150,
  },
  description: {
    type: String,
    maxLength: 2000,
  },
  color: {
    type: String,
    maxLength: 50,
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
    required: [true, 'Введите закупочную цену'],
  },
  delivery_price: {
    type: String,
    required: [true, 'Введите цену доставки'],
  },
  update_price: {
    type: Boolean,
    default: true,
  },
  height: {
    type: Number,
    required: [true, 'Введите высоту'],
  },
  length: {
    type: Number,
    required: [true, 'Введите длинну'],
  },
  width: {
    type: Number,
    required: [true, 'Введите ширину'],
  },
  weight: {
    type: Number,
    required: [true, 'Введите вес'],
  },
  brand: {
    type: String,
    maxLength: 100,
  },
  provider: {
    type: String,
    maxLength: 200,
  },
  addresses: {
    type: Map,
    of: String,
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
    sparse: true,
    type: String,
  },
  marketplace_data: {
    type: Map,
    of: String,
  },
})
ProductSchema.plugin(uniqueValidator, {
  message: 'Поле {PATH} должно быть уникальным.',
})
ProductSchema.index({ name: 'text' })

const ProductModel = mongoose.model('Product', ProductSchema)
export default ProductModel
