import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

export interface IWBOrder {
  order_id: string
  wb_order_id: string
  created: Date
  products: { id: string; count: number }[]
  cost: number
  status: number
  warehouse_id: string
  wb_order: any
}

const WBOrderSchema = new mongoose.Schema<IWBOrder>({
  order_id: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
  },
  wb_order_id: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
  },
  created: {
    type: Date,
    required: true,
  },

  wb_order: {
    type: Object,
    required: true,
  },
  products: [
    {
      id: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        required: true,
      },
    },
  ],
  cost: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  warehouse_id: {
    type: String,
    required: true,
  },
})
WBOrderSchema.plugin(uniqueValidator, {
  message: 'Поле {PATH} должно быть уникальным.',
})
const WBOrderModel = mongoose.model('WBOrder', WBOrderSchema)

export default WBOrderModel
