import mongoose from 'mongoose'

export interface IProductIn {
  warehouse: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

const ProductInSchema = new mongoose.Schema<IProductIn>({
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

const ProductInModel = mongoose.model('ProductIn', ProductInSchema)

export default ProductInModel
