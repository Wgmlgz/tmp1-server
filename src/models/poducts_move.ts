import mongoose from 'mongoose'

export interface IProductMove {
  warehouse_from: string
  warehouse_to: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

const ProductMoveSchema = new mongoose.Schema<IProductMove>({
  warehouse_from: {
    type: String,
    required: true,
  },
  warehouse_to: {
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

const ProductMoveModel = mongoose.model('ProductMove', ProductMoveSchema)

export default ProductMoveModel
