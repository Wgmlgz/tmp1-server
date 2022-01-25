import mongoose from 'mongoose'

export interface IProductOut {
  warehouse: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

const ProductOutSchema = new mongoose.Schema<IProductOut>({
  warehouse: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
  },
  products: [
    {
      product: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
})

const ProductOutModel = mongoose.model('ProductOut', ProductOutSchema)

export default ProductOutModel
